const express = require('express');
const Listing = require('../models/Listing');
const { auth, studentAuth, adminAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { requiresApprovalChange } = require('../services/listingRules');
const { storeListingImages } = require('../services/media');

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
  const images = await storeListingImages(req.files || []);
  const listing = await Listing.create({
    title, description, price: Number(price), category, condition, pickupPoint,
    seller: req.user._id,
    images,
    bookDetails: bookDetails ? JSON.parse(bookDetails) : undefined,
    tags: tags ? JSON.parse(tags) : []
  });
  res.status(201).json({ message: 'Listing submitted for approval', listing });
});

router.put('/:id', auth, studentAuth, uploadMultiple('images', 50), async (req, res) => {
  const listing = await Listing.findOne({ _id: req.params.id, seller: req.user._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (['reserved', 'sold'].includes(listing.status)) {
    return res.status(409).json({ message: 'Reserved or sold listings cannot be edited' });
  }

  const allowedFields = ['title', 'description', 'price', 'category', 'condition', 'pickupPoint', 'bookDetails', 'tags'];
  const changes = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) changes[field] = req.body[field];
  });
  const replacingImages = Boolean(req.files?.length);
  if (replacingImages && req.files.length < 2) return res.status(400).json({ message: 'At least two images are required' });
  if (!Object.keys(changes).length && !replacingImages) return res.status(400).json({ message: 'No listing changes were provided' });

  try {
    if (changes.price !== undefined) changes.price = Number(changes.price);
    if (changes.bookDetails !== undefined && typeof changes.bookDetails === 'string') changes.bookDetails = JSON.parse(changes.bookDetails);
    if (changes.tags !== undefined && typeof changes.tags === 'string') changes.tags = JSON.parse(changes.tags);
  } catch (error) {
    return res.status(400).json({ message: 'Book details and tags must be valid JSON' });
  }

  const approvalRequired = requiresApprovalChange(listing, changes, replacingImages);
  Object.assign(listing, changes);
  if (replacingImages) listing.images = await storeListingImages(req.files);
  if (approvalRequired) {
    listing.status = 'pending';
    listing.approvedBy = undefined;
    listing.approvedAt = undefined;
    listing.rejectionReason = undefined;
  }
  await listing.save();
  res.json({ message: approvalRequired ? 'Listing updated and submitted for approval' : 'Listing updated', listing });
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