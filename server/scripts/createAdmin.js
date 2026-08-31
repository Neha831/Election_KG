

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/admin");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voter_search_portal";

async function main() {
  const [, , username, password] = process.argv;

  if (!username || !password) {
    console.error("Usage: node createAdmin.js <username> <password>");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.error(`Admin "${username}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await Admin.hashPassword(password);
  await Admin.create({ username, passwordHash });

  console.log(`Admin "${username}" created successfully.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
