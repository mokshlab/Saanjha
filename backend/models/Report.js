const mongoose = require('mongoose');

const reportReasons = ['scam', 'harassment', 'inappropriate', 'misleading', 'other'];

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['listing', 'user'], required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, enum: reportReasons, required: true },
  details: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['open', 'resolved', 'rejected'], default: 'open' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  resolutionNote: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: true });

reportSchema.pre('validate', function (next) {
  const hasListing = Boolean(this.listing);
  const hasReportedUser = Boolean(this.reportedUser);

  if (this.targetType === 'listing' && (!hasListing || hasReportedUser)) {
    this.invalidate('listing', 'A listing report must reference only a listing');
  }
  if (this.targetType === 'user' && (!hasReportedUser || hasListing)) {
    this.invalidate('reportedUser', 'A user report must reference only a user');
  }
  next();
});

reportSchema.index(
  { reporter: 1, targetType: 1, listing: 1, reportedUser: 1 },
  { unique: true, partialFilterExpression: { status: 'open' } }
);
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
