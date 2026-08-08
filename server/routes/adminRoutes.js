const express = require("express");
const jwt = require("jsonwebtoken");
// const Admin = require("../models/Admin");
const Admin = require("../models/admin");
const Voter = require("../models/Voter");
const { adminAuth, JWT_SECRET } = require("../middleware/adminAuth");

const router = express.Router();

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await admin.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats  (protected)
// Returns overall counts + a breakdown per taluka/village
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const overall = await Voter.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const overallCounts = { pending: 0, done: 0, not_done: 0 };
    overall.forEach((row) => {
      overallCounts[row._id] = row.count;
    });

    const byTaluka = await Voter.aggregate([
      {
        $group: {
          _id: { taluka: "$taluka", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.taluka",
          statuses: { $push: { status: "$_id.status", count: "$count" } },
          total: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byVillage = await Voter.aggregate([
      {
        $group: {
          _id: { taluka: "$taluka", village: "$village", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { taluka: "$_id.taluka", village: "$_id.village" },
          statuses: { $push: { status: "$_id.status", count: "$count" } },
          total: { $sum: "$count" },
        },
      },
      { $sort: { "_id.taluka": 1, "_id.village": 1 } },
    ]);

    const totalVoters = overallCounts.pending + overallCounts.done + overallCounts.not_done;

    res.json({
      totalVoters,
      overall: overallCounts,
      byTaluka,
      byVillage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
