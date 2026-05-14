const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  company:     { type: String, required: true, trim: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Engineering', 'Design', 'Data Science', 'Management', 'Marketing', 'Other'],
    required: true
  },
  location:    { type: String, default: 'Remote' },
  jobLink:     { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);