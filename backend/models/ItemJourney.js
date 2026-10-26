const mongoose = require('mongoose');

const itemJourneySchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  event: { type: String, enum: ['listed', 'approved', 'reserved', 'expired', 'cancelled', 'completed'], required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

itemJourneySchema.index({ listing: 1, createdAt: 1 });

module.exports = mongoose.model('ItemJourney', itemJourneySchema);