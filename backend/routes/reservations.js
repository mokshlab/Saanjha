const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const ItemJourney = require('../models/ItemJourney');
const Notification = require('../models/Notification');
const { auth, studentAuth } = require('../middleware/auth');

const router = express.Router();
const durationOptions = [3, 6, 12, 24, 36, 54, 72, 96];

async function expireReservations() {
  const reservations = await Reservation.find({ status: 'active', expiresAt: { $lte: new Date() } });
  for (const reservation of reservations) {
    const expired = await Reservation.findOneAndUpdate(
      { _id: reservation._id, status: 'active' },
      { status: 'expired', releasedAt: new Date() },
      { new: true }
    );
    if (!expired) continue;
    await Listing.findOneAndUpdate(
      { _id: expired.listing, status: 'reserved', reservedBy: expired.buyer },
      { status: 'approved', $unset: { reservedBy: 1, reservedUntil: 1 } }
    );
    await ItemJourney.create({ listing: expired.listing, reservation: expired._id, event: 'expired', actor: expired.buyer });
    await Notification.create({
      recipient: expired.buyer,
      reservation: expired._id,
      type: 'expired',
      message: 'Your reservation expired and the item is available again.'
    });
  }
}

router.get('/mine', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const reservations = await Reservation.find({ buyer: req.user._id }).populate('listing', 'title status reservedUntil').sort({ createdAt: -1 });
  res.json({ reservations });
});

router.get('/notifications', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json({ notifications });
});

router.post('/:listingId', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const durationHours = Number(req.body.durationHours || 54);
  if (!durationOptions.includes(durationHours)) {
    return res.status(400).json({ message: 'Choose a valid reservation duration' });
  }

  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
  const handoverCode = crypto.randomInt(1000, 10000).toString();
  const handoverCodeHash = await bcrypt.hash(handoverCode, 10);
  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.listingId, status: 'approved', seller: { $ne: req.user._id } },
    { status: 'reserved', reservedBy: req.user._id, reservedUntil: expiresAt },
    { new: true }
  );
  if (!listing) return res.status(409).json({ message: 'Listing is no longer available' });

  let reservation;
  try {
    reservation = await Reservation.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      durationHours,
      expiresAt,
      handoverCodeHash
    });
    await ItemJourney.create({ listing: listing._id, reservation: reservation._id, event: 'reserved', actor: req.user._id });
    res.status(201).json({ message: 'Listing reserved', handoverCode, reservation });
  } catch (error) {
    if (reservation) await Reservation.deleteOne({ _id: reservation._id });
    await Listing.findOneAndUpdate(
      { _id: listing._id, status: 'reserved', reservedBy: req.user._id },
      { status: 'approved', $unset: { reservedBy: 1, reservedUntil: 1 } }
    );
    if (error.code === 11000) return res.status(409).json({ message: 'You already have an active reservation' });
    res.status(500).json({ message: 'Reservation failed' });
  }
});

router.post('/:reservationId/cancel', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const reservation = await Reservation.findOne({
    _id: req.params.reservationId,
    status: 'active',
    $or: [{ buyer: req.user._id }, { seller: req.user._id }]
  });
  if (!reservation) return res.status(404).json({ message: 'Active reservation not found' });

  reservation.status = 'cancelled';
  reservation.releasedAt = new Date();
  await reservation.save();
  await Listing.findOneAndUpdate(
    { _id: reservation.listing, status: 'reserved', reservedBy: reservation.buyer },
    { status: 'approved', $unset: { reservedBy: 1, reservedUntil: 1 } }
  );
  await ItemJourney.create({ listing: reservation.listing, reservation: reservation._id, event: 'cancelled', actor: req.user._id });
  const recipient = reservation.buyer.equals(req.user._id) ? reservation.seller : reservation.buyer;
  await Notification.create({
    recipient,
    reservation: reservation._id,
    type: 'cancelled',
    message: 'A reservation was cancelled and the item is available again.'
  });
  res.json({ message: 'Reservation cancelled', reservation });
});

router.post('/:reservationId/handover', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const reservation = await Reservation.findOne({ _id: req.params.reservationId, status: 'active', seller: req.user._id });
  if (!reservation) return res.status(404).json({ message: 'Active seller reservation not found' });
  if (!/^\d{4}$/.test(req.body.code || '') || !(await reservation.verifyHandoverCode(req.body.code))) {
    return res.status(400).json({ message: 'Invalid handover code' });
  }

  const completedAt = new Date();
  const completed = await Reservation.findOneAndUpdate(
    { _id: reservation._id, status: 'active', seller: req.user._id },
    { status: 'completed', handoverConfirmedAt: completedAt, releasedAt: completedAt },
    { new: true }
  );
  if (!completed) return res.status(409).json({ message: 'Reservation is no longer active' });
  await Listing.findOneAndUpdate(
    { _id: completed.listing, status: 'reserved', reservedBy: completed.buyer },
    { status: 'sold', soldAt: completedAt, $unset: { reservedBy: 1, reservedUntil: 1 } }
  );
  await ItemJourney.create({ listing: completed.listing, reservation: completed._id, event: 'completed', actor: req.user._id });
  res.json({ message: 'Handover confirmed', reservation: completed });
});

module.exports = router;
module.exports.expireReservations = expireReservations;