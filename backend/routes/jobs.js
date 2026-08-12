const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/jobs  — Browse all active jobs (users) — UC-04
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (search)   query.$or = [{ title: new RegExp(search, 'i') }, { company: new RegExp(search, 'i') }];
    if (category) query.category = category;

    const total = await Job.countDocuments(query);
    const jobs  = await Job.find(query)
      .populate('postedBy', 'firstName lastName')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: total, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id  — Single job detail
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'firstName lastName');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/jobs  — Admin create job — UC-03
router.post('/', protect, adminOnly, [
  body('company').notEmpty().withMessage('Company required'),
  body('title').notEmpty().withMessage('Title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('category').notEmpty().withMessage('Category required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/jobs/:id  — Admin update job — UC-03
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/jobs/:id  — Admin delete job — UC-03
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;