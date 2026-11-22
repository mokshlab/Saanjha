const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', auth, adminAuth, async (req, res) => {
  const [users, activeListings, pendingListings, rejectedListings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments({ status: 'approved' }),
    Listing.countDocuments({ status: 'pending' }),
    Listing.countDocuments({ status: 'rejected' })
  ]);
  res.json({ users, activeListings, pendingListings, rejectedListings });
});

router.get('/users', auth, adminAuth, async (req, res) => {
  res.json({ users: await User.find().select('-password -otpCodeHash').sort({ createdAt: -1 }) });
});

router.put('/users/:id/toggle-status', auth, adminAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ user });
});

router.get('/reports', auth, adminAuth, async (req, res) => {
  const filter = {};
  if (req.query.status) {
    if (!['open', 'resolved', 'rejected'].includes(req.query.status)) {
      return res.status(400).json({ message: 'Invalid report status' });
    }
    filter.status = req.query.status;
  }

  const reports = await Report.find(filter)
    .populate('reporter', 'name email college')
    .populate('listing', 'title status seller')
    .populate('reportedUser', 'name email college')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ reports });
});

router.patch('/reports/:id', auth, adminAuth, async (req, res) => {
  const { status, resolutionNote } = req.body;
  if (!['resolved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Report status must be resolved or rejected' });
  }
  if (resolutionNote !== undefined &&
    (typeof resolutionNote !== 'string' || resolutionNote.trim().length > 1000)) {
    return res.status(400).json({ message: 'Resolution note must be text with at most 1000 characters' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid report id' });
  }

  const report = await Report.findOne({ _id: req.params.id, status: 'open' });
  if (!report) return res.status(404).json({ message: 'Open report not found' });

  report.status = status;
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  report.resolutionNote = typeof resolutionNote === 'string'
    ? resolutionNote.trim()
    : undefined;
  await report.save();

  const populatedReport = await Report.findById(report._id)
    .populate('reporter', 'name email college')
    .populate('listing', 'title status seller')
    .populate('reportedUser', 'name email college')
    .populate('reviewedBy', 'name email');
  res.json({ message: `Report ${status}`, report: populatedReport });
});

module.exports = router;