const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  filename:     { type: String, required: true }, // stored filename on disk
  fileType:     { type: String, enum: ['Resume', 'Cover Letter', 'Job Description', 'Other'], default: 'Resume' },
  mimeType:     { type: String },
  size:         { type: Number }, // bytes
  path:         { type: String, required: true },
  application:  { type: mongoose.Schema.Types.ObjectId, ref: 'Application' }, // optional link
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);