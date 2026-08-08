// server/scripts/clearVoters.js
//
// Deletes every document in the voters collection so you can re-import
// cleanly. Uses the same MONGO_URI your app already connects with.
//
// Usage: node scripts/clearVoters.js

require('dotenv').config();
const mongoose = require('mongoose');
const Voter = require('../models/Voter');

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set (check your .env file)');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.');

  const before = await Voter.countDocuments();
  console.log(`Voters currently in database: ${before}`);

  const result = await Voter.deleteMany({});
  console.log(`Deleted: ${result.deletedCount}`);

  const after = await Voter.countDocuments();
  console.log(`Voters remaining: ${after}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
