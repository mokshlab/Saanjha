const express = require('express');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const User = require('../models/User');
const { auth, studentAuth } = require('../middleware/auth');

const router = express.Router();
const reportReasons = new Set(['scam', 'harassment', 'inappropriate', 'misleading', 'other']);

function normalizeDetails(details) {
  if (details === undefined || details === null || details === '') return undefined;
  return typeof details === 'string' ? details.trim() : null;
}

router.post('/', auth, studentAuth, async (req, res) => {
  const { targetType, listingId, userId, reason } = req.body;
  const details = normalizeDetails(req.body.details);

  if (!['listing', 'user'].includes(targetType) || !reportReasons.has(reason)) {
    return res.status(400).json({ message: 'Choose a valid report target and reason' });
  }
  if (details === null || details?.length > 1000) {
    return res.status(400).json({ message: 'Report details must be text with at most 1000 characters' });
  }

  let target;
  const reportData = {
    reporter: req.user._id,
    targetType,
    reason,
    details
  };

  if (targetType === 'listing') {
    if (!listingId || userId) return res.status(400).json({ message: 'A listing report requires only listingId' });
    if (!mongoose.isValidObjectId(listingId)) return res.status(400).json({ message: 'Invalid listingId' });
    target = await Listing.findOne({
      _id: listingId,
      status: { $in: ['approved', 'reserved'] }
    }).select('seller');
    if (!target) return res.status(404).json({ message: 'Listing not found' });
    if (String(target.seller) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot report your own listing' });
    }
    reportData.listing = target._id;
  } else {
    if (!userId || listingId) return res.status(400).json({ message: 'A user report requires only userId' });
    if (!mongoose.isValidObjectId(userId)) return res.status(400).json({ message: 'Invalid userId' });
    target = await User.findOne({ _id: userId, role: 'student' }).select('_id');
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }
    reportData.reportedUser = target._id;
  }

  try {
    const report = await Report.create(reportData);
    return res.status(201).json({ message: 'Report submitted for review', report });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already have an open report for this target' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Could not submit report' });
  }
});

router.get('/mine', auth, studentAuth, async (req, res) => {
  const reports = await Report.find({ reporter: req.user._id })
    .populate('listing', 'title status')
    .populate('reportedUser', 'name college')
    .sort({ createdAt: -1 });
  res.json({ reports });
});

module.exports = router;
