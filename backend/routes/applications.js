const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// GET /api/applications  — UC-09 Search & filter own applications
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;
    if (search) query.$or = [
      { company:  new RegExp(search, 'i') },
      { position: new RegExp(search, 'i') }
    ];

    const total = await Application.countDocuments(query);
    const apps  = await Application.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: total, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/applications/stats  — UC-10 Dashboard stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const total = await Application.countDocuments({ user: userId });
    const byStatus = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      stats: {
        total,
        applied:   statusMap['Applied']   || 0,
        screening: statusMap['Screening'] || 0,
        interview: statusMap['Interview'] || 0,
        offer:     statusMap['Offer']     || 0,
        rejected:  statusMap['Rejected']  || 0,
        offerRate: total ? Math.round(((statusMap['Offer'] || 0) / total) * 100) : 0,
        interviewRate: total ? Math.round(((statusMap['Interview'] || 0) / total) * 100) : 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/applications/:id  — single application
router.get('/:id', protect, async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/applications  — UC-04 Apply for job / add application
router.post('/', protect, [
  body('company').notEmpty().withMessage('Company required'),
  body('position').notEmpty().withMessage('Position required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { jobId, company, position, jobLink, contactPerson, dateApplied, notes } = req.body;

    // If applying to a platform job, increment its counter
    if (jobId) {
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId || null,
      company, position, jobLink, contactPerson, dateApplied, notes,
      statusHistory: [{ status: 'Applied', note: 'Application created' }]
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/applications/:id  — UC-05 Update status / edit
router.put('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const { status, note, ...rest } = req.body;

    // Record status change in history
    if (status && status !== application.status) {
      application.statusHistory.push({ status, note: note || `Status changed to ${status}` });
      application.status = status;
    }

    Object.assign(application, rest);
    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/applications/:id  — UC-12 Delete application
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;