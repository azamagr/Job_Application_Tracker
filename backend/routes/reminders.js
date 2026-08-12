const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

// SendGrid setup - only if real key exists
let sgMail = null;
if (process.env.SENDGRID_API_KEY && 
    process.env.SENDGRID_API_KEY !== 'skip' &&
    process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
} else {
  console.log('⚠️  SendGrid not configured - emails will be skipped');
}

const sendReminderEmail = async (toEmail, userName, application, reminder) => {
  if (!sgMail) {
    console.log('⚠️  Email skipped - SendGrid not configured');
    return;
  }

  const typeEmoji = {
    'Interview':      '🎯',
    'Follow-up':      '📧',
    'Deadline':       '⏰',
    'Offer response': '✅'
  };

  const emoji = typeEmoji[reminder.type] || '🔔';
  const date  = new Date(reminder.reminderDate).toLocaleString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const msg = {
    to:   toEmail,
    from: {
      email: process.env.FROM_EMAIL,
      name:  process.env.FROM_NAME || 'JobTracker'
    },
    subject: `${emoji} Reminder: ${reminder.type} - ${application.company}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f5f5f5;padding:24px;border-radius:12px">
        <div style="background:#185FA5;color:#fff;padding:18px 22px;border-radius:10px;margin-bottom:20px">
          <h2 style="margin:0;font-size:20px">${emoji} Job Application Reminder</h2>
          <p style="margin:4px 0 0;opacity:.85;font-size:13px">Job Application Tracker</p>
        </div>

        <div style="background:#fff;border-radius:10px;padding:20px;margin-bottom:16px">
          <p style="font-size:15px;color:#333;margin:0 0 16px">Hello <strong>${userName}</strong>,</p>
          <p style="font-size:14px;color:#555;margin:0 0 16px">You have an upcoming reminder:</p>

          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#888;width:130px">Company</td>
              <td style="padding:10px 0;font-weight:600;color:#1a1a18">${application.company}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#888">Position</td>
              <td style="padding:10px 0;color:#333">${application.position}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#888">Reminder Type</td>
              <td style="padding:10px 0;font-weight:600;color:#185FA5">${reminder.type}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#888">Date & Time</td>
              <td style="padding:10px 0;font-weight:600;color:#185FA5">${date}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px 0;color:#888">Notify Via</td>
              <td style="padding:10px 0;color:#333">${reminder.notifyVia}</td>
            </tr>
            ${reminder.message ? `
            <tr>
              <td style="padding:10px 0;color:#888">Note</td>
              <td style="padding:10px 0;color:#333">${reminder.message}</td>
            </tr>` : ''}
          </table>
        </div>

        <div style="background:#E6F1FB;border-radius:8px;padding:14px 16px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#0C447C">
            💡 <strong>Tip:</strong> Log in to Job Application Tracker to update your application status after the ${reminder.type.toLowerCase()}.
          </p>
        </div>

        <p style="font-size:12px;color:#aaa;text-align:center;margin:0">
          This reminder was set by you on Job Application Tracker.<br>
          Good luck with your application! 🚀
        </p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${toEmail}`);
  } catch (err) {
    console.error('❌ SendGrid error:', err.response?.body?.errors || err.message);
    throw err;
  }
};

// GET /api/reminders
router.get('/', protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id, isActive: true })
      .populate('application', 'company position')
      .sort('reminderDate');
    res.json({ success: true, reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reminders - create + send email
router.post('/', protect, [
  body('application').notEmpty().withMessage('Application ID required'),
  body('type').notEmpty().withMessage('Reminder type required'),
  body('reminderDate').isISO8601().withMessage('Valid date required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const reminder = await Reminder.create({ ...req.body, user: req.user._id });
    await reminder.populate('application', 'company position');

    // Send email if notifyVia is Email or Both
    if (reminder.notifyVia !== 'In-app') {
      try {
        await sendReminderEmail(
          req.user.email,
          `${req.user.firstName} ${req.user.lastName}`,
          reminder.application,
          reminder
        );
        console.log(`📧 Reminder email sent to: ${req.user.email}`);
      } catch (emailErr) {
        // Do not fail the whole request if email fails
        console.error('❌ Email sending failed:', emailErr.message);
      }
    }

    res.status(201).json({ 
      success: true, 
      reminder,
      emailSent: reminder.notifyVia !== 'In-app' && !!sgMail
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/reminders/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    ).populate('application', 'company position');
    if (!reminder)
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;