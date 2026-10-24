const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const durationOptions = [3, 6, 12, 24, 36, 54, 72, 96];

const reservationSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  durationHours: { type: Number, enum: durationOptions, default: 54 },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'completed'], default: 'active' },
  reservedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  releasedAt: Date,
  handoverCodeHash: String,
  handoverConfirmedAt: Date
}, { timestamps: true });

reservationSchema.index({ listing: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
reservationSchema.index({ buyer: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

reservationSchema.methods.verifyHandoverCode = function (code) {
  return bcrypt.compare(code, this.handoverCodeHash || '');
};

reservationSchema.set('toJSON', {
  transform: (document, returned) => {
    delete returned.handoverCodeHash;
    return returned;
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);