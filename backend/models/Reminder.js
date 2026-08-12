const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  type: {
    type: String,
    enum: ['Interview', 'Follow-up', 'Deadline', 'Offer response'],
    required: true
  },
  reminderDate: { type: Date, required: true },
  notifyVia:    { type: String, enum: ['Email', 'In-app', 'Both'], default: 'Both' },
  message:      { type: String, default: '' },
  isSent:       { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', ReminderSchema);