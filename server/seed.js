require("dotenv").config();
const mongoose = require("mongoose");
const Voter = require("./models/Voter");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/voter_search_portal";

const sampleData = [
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 243,
    voterName: "ABC Patil",
    mobileNo: "9876543210",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 244,
    voterName: "XYZ Shinde",
    mobileNo: "9876543211",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 245,
    voterName: "Ramesh Jadhav",
    mobileNo: "9876543212",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 246,
    voterName: "Sanjay Mane",
    mobileNo: "9876543213",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 247,
    voterName: "Sunita Pawar",
    mobileNo: "9876543214",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 248,
    voterName: "Mahesh Patil",
    mobileNo: "9876543215",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 249,
    voterName: "Anita Shinde",
    mobileNo: "9876543216",
  },
  {
    district: "Satara",
    taluka: "Karad",
    village: "Karad",
    institute: "Z.P. Primary School, Karad",
    partNo: "115",
    srNo: 250,
    voterName: "Vikas Jagtap",
    mobileNo: "9876543217",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    await Voter.deleteMany({});
    await Voter.insertMany(sampleData);
    console.log(`Inserted ${sampleData.length} voter records.`);
  } catch (err) {
    console.error("Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
