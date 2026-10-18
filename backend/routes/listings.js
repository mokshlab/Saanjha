const express = require('express');
const Listing = require('../models/Listing');
const { auth, studentAuth, adminAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  const { search, category, condition, page = 1, limit = 12 } = req.query;
  const query = { status: 'approved' };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (condition) query.condition = condition;
  const items = await Listing.find(query).populate('seller', 'name college').sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
  const totalItems = await Listing.countDocuments(query);
  res.json({ items, totalItems, currentPage: Number(page), totalPages: Math.ceil(totalItems / Number(limit)) });
});

router.get('/me/listings', auth, studentAuth, async (req, res) => {
  res.json({ listings: await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 }) });
});

router.get('/moderation/pending', auth, adminAuth, async (req, res) => {
  res.json({ listings: await Listing.find({ status: 'pending' }).populate('seller', 'name email college').sort({ createdAt: -1 }) });
});

router.get('/:id', async (req, res) => {
  const item = await Listing.findOne({ _id: req.params.id, status: { $in: ['approved', 'reserved'] } }).populate('seller', 'name college');
  if (!item) return res.status(404).json({ message: 'Listing not found' });
  res.json({ item });
});

router.post('/', auth, studentAuth, uploadMultiple('images', 50), async (req, res) => {
  const { title, description, price, category, condition, pickupPoint, bookDetails, tags } = req.body;
  if (!title || !description || price === undefined || !category || !condition || !pickupPoint) {
    return res.status(400).json({ message: 'Title, description, price, category, condition, and pickup point are required' });
  }
  if (!req.files || req.files.length < 2) return res.status(400).json({ message: 'At least two images are required' });
  const listing = await Listing.create({
    title, description, price: Number(price), category, condition, pickupPoint,
    seller: req.user._id,
    images: (req.files || []).map((file) => file.path),
    bookDetails: bookDetails ? JSON.parse(bookDetails) : undefined,
    tags: tags ? JSON.parse(tags) : []
  });
  res.status(201).json({ message: 'Listing submitted for approval', listing });
});

router.put('/:id/approve', auth, adminAuth, async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'approved', approvedBy: req.user._id, approvedAt: new Date(), rejectionReason: undefined }, { new: true });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json({ message: 'Listing approved', listing });
});

router.put('/:id/reject', auth, adminAuth, async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: req.body.reason || 'Rejected by administrator' }, { new: true });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json({ message: 'Listing rejected', listing });
});

module.exports = router;