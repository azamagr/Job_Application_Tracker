require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('=== SendGrid Email Test ===');
console.log('API Key:', process.env.SENDGRID_API_KEY ? 
  process.env.SENDGRID_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('FROM_NAME:', process.env.FROM_NAME);

if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  console.log('❌ ERROR: Invalid API key - must start with SG.');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to:   process.env.FROM_EMAIL,
  from: { 
    email: process.env.FROM_EMAIL, 
    name:  process.env.FROM_NAME || 'JobTracker'
  },
  subject: '✅ Test Email - Job Application Tracker',
  html: `
    <div style="font-family:Arial,sans-serif;padding:24px;max-width:400px;margin:0 auto">
      <h2 style="color:#185FA5">✅ Email Test Successful!</h2>
      <p>Your SendGrid is working correctly.</p>
      <p>Reminder emails will now be delivered to users.</p>
      <hr>
      <small style="color:#888">Job Application Tracker — BSSE FYP</small>
    </div>
  `
};

sgMail.send(msg)
  .then(() => {
    console.log('✅ SUCCESS! Test email sent to:', process.env.FROM_EMAIL);
    console.log('Check your Gmail inbox (and spam folder)');
  })
  .catch(err => {
    console.log('❌ FAILED:', err.message);
    if (err.response) {
      console.log('Error details:', JSON.stringify(err.response.body, null, 2));
    }
  });