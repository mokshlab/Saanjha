const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
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

module.exports = router;