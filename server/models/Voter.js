// const mongoose = require('mongoose');

// const voterSchema = new mongoose.Schema(
//   {
//     district: { type: String, default: '' },
//     taluka: { type: String, default: '' },
//     village: { type: String, default: '' },
//     institute: { type: String, default: '' },
//     part: { type: String, default: '' },
//     srNo: { type: String, default: '' },
//     electorName: { type: String, default: '' },
//     address: { type: String, default: '' },
//     mobileNo: { type: String, default: '' },

//     status: {
//       type: String,
//       enum: ['pending', 'done', 'not_done'],
//       default: 'pending',
//     },
//   },
//   { timestamps: true }
// );

// voterSchema.index({ district: 1, taluka: 1, village: 1, institute: 1 });
// voterSchema.index({ electorName: 'text' });

// module.exports = mongoose.model('Voter', voterSchema);


// server/models/Voter.js
const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema(
  {
    district: { type: String, default: '' },
    taluka: { type: String, default: '' },
    village: { type: String, default: '' },
    institute: { type: String, default: '' },
    part: { type: String, default: '' },
    srNo: { type: String, default: '' },
    electorName: { type: String, default: '' },
    mobileNo: { type: String, default: '' },
    address: { type: String, default: '' },

    // Used by PATCH /voters/:id/status and the row coloring in SearchResults.jsx
    status: {
      type: String,
      enum: ['pending', 'done', 'not_done'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// buildFilter() in voterRoutes.js filters by exactly these fields
voterSchema.index({ district: 1, taluka: 1, village: 1, institute: 1 });
voterSchema.index({ electorName: 'text' });

module.exports = mongoose.model('Voter', voterSchema);