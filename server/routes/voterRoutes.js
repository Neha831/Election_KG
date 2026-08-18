

const express = require("express");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const Voter = require("../models/Voter");
const { adminAuth } = require("../middleware/adminAuth");

const router = express.Router();

function buildFilter(query) {
  const { district, taluka, village, institute, q } = query;
  const filter = {};
  if (district) filter.district = district;
  if (taluka) filter.taluka = taluka;
  if (village) filter.village = village;
  if (institute) filter.institute = institute;
  if (q) filter.electorName = { $regex: q, $options: "i" };
  return filter;
}

router.get("/meta/districts", async (req, res) => {
  try {
    const districts = await Voter.distinct("district");
    res.json(districts.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/meta/talukas", async (req, res) => {
  try {
    const { district } = req.query;
    const filter = district ? { district } : {};
    const talukas = await Voter.distinct("taluka", filter);
    res.json(talukas.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/meta/villages", async (req, res) => {
  try {
    const { district, taluka } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (taluka) filter.taluka = taluka;
    const villages = await Voter.distinct("village", filter);
    res.json(villages.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/meta/institutes", async (req, res) => {
  try {
    const { district, taluka, village } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (taluka) filter.taluka = taluka;
    if (village) filter.village = village;
    const institutes = await Voter.distinct("institute", filter);
    res.json(institutes.sort());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/voters", async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const voters = await Voter.find(filter).sort({ part: 1, srNo: 1 }).lean();
    res.json({ count: voters.length, results: voters });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/voters/:id/status
// Open to volunteers (no auth) - this is the in-field status update.
router.patch("/voters/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "done", "not_done"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${allowed.join(", ")}` });
    }

    const voter = await Voter.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).lean();

    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    res.json(voter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Excel export - admin only, includes every field
router.get("/voters/export/excel", adminAuth, async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const voters = await Voter.find(filter).sort({ part: 1, srNo: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Voters");

    sheet.columns = [
      { header: "Part No", key: "part", width: 10 },
      { header: "Sr. No", key: "srNo", width: 10 },
      { header: "Voter Name", key: "electorName", width: 28 },
      { header: "Mobile No", key: "mobileNo", width: 16 },
      { header: "District", key: "district", width: 18 },
      { header: "Taluka", key: "taluka", width: 18 },
      { header: "Village", key: "village", width: 18 },
      { header: "Institute Name", key: "institute", width: 32 },
      { header: "Address", key: "address", width: 36 },
      { header: "Status", key: "status", width: 14 },
    ];
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B2E6B" },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    const statusFill = {
      done: "FFC6EFCE",
      not_done: "FFFFC7CE",
      pending: "FFFFEB9C",
    };

    voters.forEach((v) => {
      const row = sheet.addRow(v);
      const fillColor = statusFill[v.status] || null;
      if (fillColor) {
        row.getCell("status").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      }
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=voters.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PDF export - admin only, includes every field
router.get("/voters/export/pdf", adminAuth, async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const voters = await Voter.find(filter).sort({ part: 1, srNo: 1 }).lean();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=voters.pdf");

    const doc = new PDFDocument({
      margin: 30,
      size: "A4",
      layout: "landscape",
    });
    doc.pipe(res);

    doc
      .fontSize(16)
      .fillColor("#0B2E6B")
      .text("Voter Search Portal - Results", { align: "center" });
    doc.moveDown();

    const colX = [40, 90, 140, 320, 420, 490, 560, 650, 720];
    const headers = [
      "Part",
      "Sr.",
      "Voter Name",
      "Mobile No",
      "District",
      "Taluka",
      "Village",
      "Institute",
      "Status",
    ];

    doc.fontSize(9).fillColor("#ffffff");
    doc.rect(40, doc.y, 720, 20).fill("#0B2E6B");
    doc.fillColor("#ffffff");
    let y = doc.y - 15;
    headers.forEach((h, i) => doc.text(h, colX[i], y));
    doc.moveDown();

    doc.fillColor("#000000");
    voters.forEach((v) => {
      const rowY = doc.y + 4;
      doc.text(String(v.part), colX[0], rowY);
      doc.text(String(v.srNo), colX[1], rowY);
      doc.text(v.electorName, colX[2], rowY);
      doc.text(v.mobileNo || "-", colX[3], rowY);
      doc.text(v.district, colX[4], rowY);
      doc.text(v.taluka, colX[5], rowY);
      doc.text(v.village, colX[6], rowY);
      doc.text(v.institute, colX[7], rowY);
      doc.text(v.status || "pending", colX[8], rowY);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;