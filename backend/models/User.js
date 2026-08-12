const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  phone:     { type: String, default: '' },
  bio:       { type: String, default: '' },
  skills:    [{ type: String }],
  careerPreferences: {
    type: String,
    enum: ['Full-time remote', 'Hybrid', 'On-site', ''],
    default: ''
  },
  avatar:    { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Virtual full name
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', UserSchema);