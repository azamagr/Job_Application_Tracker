const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require admin
router.use(protect, adminOnly);

// GET /api/admin/stats  — UC-11 System reports
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalJobs, totalApps, appsByStatus, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.find({ role: 'user' }).sort('-createdAt').limit(5).select('firstName lastName email createdAt'),
    ]);

    // Most applied jobs
    const topJobs = await Job.find().sort('-applicationCount').limit(5).select('title company applicationCount');

    const statusMap = {};
    appsByStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      stats: { totalUsers, totalJobs, totalApps },
      appsByStatus: statusMap,
      topJobs,
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users  — UC-08 View all users
router.get('/users', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName:  new RegExp(search, 'i') },
      { email:     new RegExp(search, 'i') }
    ];
    if (status === 'active')  query.isActive = true;
    if (status === 'blocked') query.isActive = false;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Add application count per user
    const userIds = users.map(u => u._id);
    const appCounts = await Application.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    appCounts.forEach(a => { countMap[a._id.toString()] = a.count; });

    const usersWithCount = users.map(u => ({
      ...u.toObject(),
      applicationCount: countMap[u._id.toString()] || 0
    }));

    res.json({ success: true, count: total, users: usersWithCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id/toggle  — UC-08 Block/unblock user
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'user' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'blocked'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id  — UC-08 Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ user: req.params.id });
    res.json({ success: true, message: 'User and their applications deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/applications  — view all applications across users
router.get('/applications', async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/applications/:id  — remove spam/fake
router.delete('/applications/:id', async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;