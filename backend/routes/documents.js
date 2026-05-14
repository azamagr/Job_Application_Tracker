const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/documents  — list user documents
router.get('/', protect, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/documents/upload  — UC-06 Upload document
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const doc = await Document.create({
      user:         req.user._id,
      originalName: req.file.originalname,
      filename:     req.file.filename,
      fileType:     req.body.fileType || 'Resume',
      mimeType:     req.file.mimetype,
      size:         req.file.size,
      path:         req.file.path,
      application:  req.body.applicationId || null,
    });
    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/documents/:id  — UC-06 Delete document
router.delete('/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Remove file from disk
    if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/documents/download/:id  — download a file
router.get('/download/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.download(doc.path, doc.originalName);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;