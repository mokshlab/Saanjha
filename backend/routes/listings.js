const express = require('express');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const { auth, studentAuth, adminAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { requiresApprovalChange } = require('../services/listingRules');
const { storeListingImages } = require('../services/media');

const router = express.Router();

function publicListingView(listing) {
  const item = listing.toObject ? listing.toObject() : { ...listing };
  item.pickupPoint = 'Campus pickup';
  if (item.seller && typeof item.seller === 'object') {
    delete item.seller.email;
  }
  return item;
}

router.get('/', async (req, res) => {
  const { search, category, condition, page = 1, limit = 12 } = req.query;
  const query = { status: 'approved' };
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (condition) query.condition = condition;
  const items = await Listing.find(query).populate('seller', 'name college').sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit));
  const totalItems = await Listing.countDocuments(query);
  res.json({
    items: items.map(publicListingView),
    totalItems,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / Number(limit))
  });
});

router.get('/me/listings', auth, studentAuth, async (req, res) => {
  res.json({ listings: await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 }) });
});

router.get('/moderation/pending', auth, adminAuth, async (req, res) => {
  res.json({ listings: await Listing.find({ status: 'pending' }).populate('seller', 'name email college').sort({ createdAt: -1 }) });
});

router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const items = await Listing.find({})
      .populate('seller', 'name college')
      .sort({ createdAt: -1 });

    res.json({ items, totalItems: items.length });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch listings.' });
  }
});
router.get('/:id', async (req, res) => {
  const item = await Listing.findOne({ _id: req.params.id, status: { $in: ['approved', 'reserved'] } }).populate('seller', 'name college');
  if (!item) return res.status(404).json({ message: 'Listing not found' });
  res.json({ item: publicListingView(item) });
});

router.post('/', auth, studentAuth, uploadMultiple('images', 50), async (req, res) => {
  const { title, description, price, category, condition, pickupPoint, bookDetails, tags } = req.body;
  if (!title || !description || price === undefined || !category || !condition || !pickupPoint) {
    return res.status(400).json({ message: 'Title, description, price, category, condition, and pickup point are required' });
  }
  if (!req.files || req.files.length < 2) return res.status(400).json({ message: 'At least two images are required' });

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ message: 'Price must be a valid non-negative number' });
  }

  let parsedBookDetails;
  let parsedTags;
  try {
    parsedBookDetails = bookDetails ? JSON.parse(bookDetails) : undefined;
    parsedTags = tags ? JSON.parse(tags) : [];
  } catch (error) {
    return res.status(400).json({ message: 'Book details and tags must be valid JSON' });
  }

  const images = await storeListingImages(req.files || []);
  const listing = await Listing.create({
    title, description, price: numericPrice, category, condition, pickupPoint,
    seller: req.user._id,
    images,
    bookDetails: parsedBookDetails,
    tags: parsedTags
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
    if (changes.price !== undefined) {
      changes.price = Number(changes.price);
      if (!Number.isFinite(changes.price) || changes.price < 0) {
        return res.status(400).json({ message: 'Price must be a valid non-negative number' });
      }
    }
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
  const currentListing = await Listing.findById(req.params.id);
  if (!currentListing) return res.status(404).json({ message: 'Listing not found' });
  if (['reserved', 'sold', 'inactive'].includes(currentListing.status)) {
    return res.status(409).json({ message: 'This listing cannot be approved in its current state' });
  }

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, status: { $nin: ['reserved', 'sold', 'inactive'] } },
    { status: 'approved', approvedBy: req.user._id, approvedAt: new Date(), rejectionReason: undefined },
    { new: true }
  );
  if (!listing) return res.status(409).json({ message: 'Listing is no longer available for approval' });
  res.json({ message: 'Listing approved', listing });
});

router.put('/:id/reject', auth, adminAuth, async (req, res) => {
  const currentListing = await Listing.findById(req.params.id);
  if (!currentListing) return res.status(404).json({ message: 'Listing not found' });
  if (['reserved', 'sold', 'inactive'].includes(currentListing.status)) {
    return res.status(409).json({ message: 'This listing cannot be rejected in its current state' });
  }

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, status: { $nin: ['reserved', 'sold', 'inactive'] } },
    { status: 'rejected', rejectionReason: req.body.reason || 'Rejected by administrator' },
    { new: true }
  );
  if (!listing) return res.status(409).json({ message: 'Listing is no longer available for rejection' });
  res.json({ message: 'Listing rejected', listing });
});
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    await listing.deleteOne();

    return res.json({ message: 'Listing deleted successfully by admin.' });
  } catch (error) {
    console.error('Admin listing deletion failed:', error.message);
    return res.status(500).json({ message: 'Could not delete listing.' });
  }
});
module.exports = router;
router.delete('/:id', auth, studentAuth, async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    if (['reserved', 'sold'].includes(listing.status)) {
      return res.status(409).json({
        message: 'Reserved or sold listings cannot be deleted.'
      });
    }

    const activeReservation = await Reservation.findOne({
      listing: listing._id,
      status: 'active'
    });

    if (activeReservation) {
      return res.status(409).json({
        message: 'This listing has an active reservation.'
      });
    }

    await listing.deleteOne();

    return res.json({ message: 'Listing deleted successfully.' });
  } catch (error) {
    console.error('Listing deletion failed:', error.message);
    return res.status(500).json({ message: 'Could not delete listing.' });
  }
});

