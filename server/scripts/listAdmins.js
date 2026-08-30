require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/admin");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voter_search_portal";

async function main() {
  await mongoose.connect(MONGO_URI);
  const admins = await Admin.find({}, { username: 1, _id: 0 });
  console.log(admins);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});