const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  type: { type: String, enum: ['expired', 'cancelled'], required: true },
  message: { type: String, required: true, trim: true, maxlength: 300 },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);