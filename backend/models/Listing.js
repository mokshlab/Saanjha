const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['books', 'cycles', 'electronics', 'accessories', 'furniture', 'clothing', 'sports', 'stationery', 'other'] },
  condition: { type: String, required: true, enum: ['new', 'like-new', 'good', 'fair', 'poor'] },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupPoint: { type: String, required: true, trim: true },
  bookDetails: { branch: String, semester: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'reserved', 'sold', 'inactive'], default: 'pending' },
  rejectionReason: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  tags: [{ type: String, trim: true }],
  reservedUntil: Date,
  soldAt: Date
}, { timestamps: true });

listingSchema.index({ title: 'text', description: 'text', tags: 'text' });
listingSchema.index({ category: 1, condition: 1, status: 1 });
listingSchema.index({ seller: 1, status: 1 });

module.exports = mongoose.model('Listing', listingSchema);