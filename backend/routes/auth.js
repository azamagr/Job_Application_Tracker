const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// SendGrid setup
let sgMail = null;
if (process.env.SENDGRID_API_KEY &&
    process.env.SENDGRID_API_KEY !== 'skip' &&
    process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { firstName, lastName, email, password, careerPreferences } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ firstName, lastName, email, password, careerPreferences });
    const token = signToken(user._id);
    res.status(201).json({
      success: true, token,
      user: { id: user._id, firstName, lastName, email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });

    const token = signToken(user._id);
    res.json({
      success: true, token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with this email' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3128/reset-password/${resetToken}`;

    // Send email if SendGrid configured
    if (sgMail) {
      const msg = {
        to:   email,
        from: { email: process.env.FROM_EMAIL, name: process.env.FROM_NAME || 'JobTracker' },
        subject: '🔐 Password Reset - Job Application Tracker',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f5f5f5;padding:24px;border-radius:12px">
            <div style="background:#185FA5;color:#fff;padding:18px 22px;border-radius:10px;margin-bottom:20px">
              <h2 style="margin:0;font-size:20px">🔐 Password Reset Request</h2>
              <p style="margin:4px 0 0;opacity:.85;font-size:13px">Job Application Tracker</p>
            </div>
            <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:16px">
              <p style="font-size:15px;color:#333">Hello <strong>${user.firstName}</strong>,</p>
              <p style="font-size:14px;color:#555;line-height:1.6">
                We received a request to reset your password. Click the button below to set a new password.
                This link will expire in <strong>15 minutes</strong>.
              </p>
              <div style="text-align:center;margin:24px 0">
                <a href="${resetUrl}" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
                  Reset My Password
                </a>
              </div>
              <p style="font-size:13px;color:#888">
                If you did not request this, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            <p style="font-size:12px;color:#aaa;text-align:center;margin:0">
              Job Application Tracker — BSSE Final Year Project
            </p>
          </div>
        `
      };

      try {
        await sgMail.send(msg);
        console.log(`✅ Password reset email sent to ${email}`);
        res.json({ success: true, message: 'Password reset link sent to your email' });
      } catch (emailErr) {
        console.error('❌ Email error:', emailErr.message);
        // Still return the token for dev/testing
        res.json({ 
          success: true, 
          message: 'Email sending failed. Use this link to reset:',
          resetUrl 
        });
      }
    } else {
      // No SendGrid - return link directly (for dev)
      res.json({ 
        success: true, 
        message: 'SendGrid not configured. Use this link:',
        resetUrl 
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  try {
    const user = await User.findOne({
      resetPasswordToken:  hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });

    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, message: 'Password reset successful', token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;