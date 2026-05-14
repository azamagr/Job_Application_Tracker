const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // null if manually added
  // Manually entered details (or copied from Job)
  company:  { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  jobLink:  { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  dateApplied:   { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  notes: { type: String, default: '' },
  // Attached documents
  resume:      { type: String, default: '' }, // filename
  coverLetter: { type: String, default: '' },
  statusHistory: [{
    status:    { type: String },
    changedAt: { type: Date, default: Date.now },
    note:      { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);