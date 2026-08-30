const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Voter = require('../models/Voter');

const FILE_PATH = process.argv[2] || path.join(__dirname, '../data/Data_KG.xlsx');
const SHEET_NAME = process.argv[3] || 'Master Voter List'; // pass a 2nd CLI arg to override
const BATCH_SIZE = 1000; // insert in chunks so 40k+ rows never hit one giant request

// Never let a blank cell disappear from the row -- turn null/undefined into ''.
const clean = (v) => (v === null || v === undefined ? '' : String(v).trim());
const titleCase = (v) =>
  clean(v)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set (check your .env file)');
  }

  console.log(`Reading ${FILE_PATH} ...`);
  const workbook = xlsx.readFile(FILE_PATH, { cellDates: false });
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    throw new Error(
      `Sheet "${SHEET_NAME}" not found. Sheets in file: ${workbook.SheetNames.join(', ')}`
    );
  }

  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
  const dataRows = rows.slice(1); // row 0 is the header
  console.log(`Found ${dataRows.length} data rows to import`);

  // Column layout in Data_KG.xlsx:
  // 0=District, 1=Part, 2=SrNo, 3=Name, 4=Institute, 5=Institute Taluka,
  // 6=Village, 7=Voting Taluka, 8=Age, 9=Gen, 10=Mobile
  const docs = dataRows.map((r) => ({
    district: clean(r[0]),
    part: clean(r[1]),
    srNo: clean(r[2]),
    electorName: clean(r[3]),
    institute: clean(r[4]),
    taluka: titleCase(r[5]),        // Institute Taluka — dropdown filter uses this
    village: clean(r[6]),
    votingTaluka: titleCase(r[7]),  // Voting Taluka — table/exports display this
    age: clean(r[8]),
    gen: clean(r[9]),
    mobileNo: clean(r[10]),
    status: 'pending',
  }));

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const result = await Voter.insertMany(batch, { ordered: false });
      inserted += result.length;
    } catch (err) {
      const okCount = err.insertedDocs ? err.insertedDocs.length : 0;
      inserted += okCount;
      failed += batch.length - okCount;
      console.error(
        `Rows ${i}-${i + batch.length}: ${batch.length - okCount} failed (${err.message})`
      );
    }
    console.log(`Progress: ${Math.min(i + BATCH_SIZE, docs.length)} / ${docs.length}`);
  }

  console.log(`\nDone. Inserted: ${inserted}, Failed: ${failed}, Total in file: ${docs.length}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});