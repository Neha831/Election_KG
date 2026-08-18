

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
 
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voter_search_portal";
 
async function main() {
  const [, , username, newPassword] = process.argv;
 
  if (!username || !newPassword) {
    console.error("Usage: node resetAdminPassword.js <username> <newPassword>");
    process.exit(1);
  }
 
  await mongoose.connect(MONGO_URI);
 
  const admin = await Admin.findOne({ username });
  if (!admin) {
    console.error(`Admin "${username}" not found.`);
    await mongoose.disconnect();
    process.exit(1);
  }
 
  admin.passwordHash = await Admin.hashPassword(newPassword);
  await admin.save();
 
  console.log(`Password updated for admin "${username}".`);
  await mongoose.disconnect();
}
 
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
 
