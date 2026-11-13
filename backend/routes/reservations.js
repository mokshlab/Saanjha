const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const ItemJourney = require('../models/ItemJourney');
const Notification = require('../models/Notification');
const { auth, studentAuth } = require('../middleware/auth');

const router = express.Router();
const durationOptions = [3, 6, 12, 24, 36, 54, 72, 96];

async function withTransaction(work) {
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function expireReservations() {
  const reservations = await Reservation.find({ status: 'active', expiresAt: { $lte: new Date() } });

  for (const reservation of reservations) {
    await withTransaction(async (session) => {
      const expired = await Reservation.findOneAndUpdate(
        { _id: reservation._id, status: 'active' },
        { status: 'expired', releasedAt: new Date() },
        { new: true, session }
      );
      if (!expired) return;

      await Listing.findOneAndUpdate(
        { _id: expired.listing, status: 'reserved', reservedBy: expired.buyer },
        { status: 'approved', $unset: { reservedBy: 1, reservedUntil: 1 } },
        { session }
      );
      await ItemJourney.create([{
        listing: expired.listing,
        reservation: expired._id,
        event: 'expired',
        actor: expired.buyer
      }], { session });
      await Notification.create([{
        recipient: expired.buyer,
        reservation: expired._id,
        type: 'expired',
        message: 'Your reservation expired and the item is available again.'
      }], { session });
    });
  }
}

router.get('/mine', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const reservations = await Reservation.find({ buyer: req.user._id })
    .populate('listing', 'title status reservedUntil price pickupPoint category description images')
    .sort({ createdAt: -1 });
  res.json({ reservations });
});

router.get('/notifications', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json({ notifications });
});

router.get('/seller/active', auth, studentAuth, async (req, res) => {
  await expireReservations();
  const reservations = await Reservation.find({
    seller: req.user._id,
    status: 'active'
  })
    .populate('listing', 'title status reservedUntil price pickupPoint')
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });
  res.json({ reservations });
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

  let reservation;
  try {
    const result = await withTransaction(async (session) => {
      const reservedListing = await Listing.findOneAndUpdate(
        { _id: req.params.listingId, status: 'approved', seller: { $ne: req.user._id } },
        { status: 'reserved', reservedBy: req.user._id, reservedUntil: expiresAt },
        { new: true, session }
      );
      if (!reservedListing) {
        const error = new Error('Listing is no longer available');
        error.statusCode = 409;
        throw error;
      }

      const [createdReservation] = await Reservation.create([{
        listing: reservedListing._id,
        buyer: req.user._id,
        seller: reservedListing.seller,
        durationHours,
        expiresAt,
        handoverCodeHash
      }], { session });
      await ItemJourney.create([{
        listing: reservedListing._id,
        reservation: createdReservation._id,
        event: 'reserved',
        actor: req.user._id
      }], { session });

      return createdReservation;
    });
    reservation = result;
    res.status(201).json({ message: 'Listing reserved', handoverCode, reservation });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You already have an active reservation' });
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    res.status(500).json({ message: 'Reservation failed' });
  }
});

router.post('/:reservationId/cancel', auth, studentAuth, async (req, res) => {
  await expireReservations();
  let cancelledReservation;
  try {
    cancelledReservation = await withTransaction(async (session) => {
      const reservation = await Reservation.findOne({
        _id: req.params.reservationId,
        status: 'active',
        $or: [{ buyer: req.user._id }, { seller: req.user._id }]
      }).session(session);
      if (!reservation) {
        const error = new Error('Active reservation not found');
        error.statusCode = 404;
        throw error;
      }

      const cancelledAt = new Date();
      reservation.status = 'cancelled';
      reservation.releasedAt = cancelledAt;
      await reservation.save({ session });
      await Listing.findOneAndUpdate(
        { _id: reservation.listing, status: 'reserved', reservedBy: reservation.buyer },
        { status: 'approved', $unset: { reservedBy: 1, reservedUntil: 1 } },
        { session }
      );
      await ItemJourney.create([{
        listing: reservation.listing,
        reservation: reservation._id,
        event: 'cancelled',
        actor: req.user._id
      }], { session });
      const recipient = reservation.buyer.equals(req.user._id) ? reservation.seller : reservation.buyer;
      await Notification.create([{
        recipient,
        reservation: reservation._id,
        type: 'cancelled',
        message: 'A reservation was cancelled and the item is available again.'
      }], { session });

      return reservation;
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: 'Reservation cancellation failed' });
  }

  res.json({ message: 'Reservation cancelled', reservation: cancelledReservation });
});

router.post('/:reservationId/handover', auth, studentAuth, async (req, res) => {
  await expireReservations();
  try {
    const completed = await withTransaction(async (session) => {
      const reservation = await Reservation.findOne({
        _id: req.params.reservationId,
        status: 'active',
        seller: req.user._id
      }).session(session);
      if (!reservation) {
        const error = new Error('Active seller reservation not found');
        error.statusCode = 404;
        throw error;
      }
      if (!/^\d{4}$/.test(req.body.code || '') || !(await reservation.verifyHandoverCode(req.body.code))) {
        const error = new Error('Invalid handover code');
        error.statusCode = 400;
        throw error;
      }

      const completedAt = new Date();
      const updatedReservation = await Reservation.findOneAndUpdate(
        { _id: reservation._id, status: 'active', seller: req.user._id },
        { status: 'completed', handoverConfirmedAt: completedAt, releasedAt: completedAt },
        { new: true, session }
      );
      if (!updatedReservation) {
        const error = new Error('Reservation is no longer active');
        error.statusCode = 409;
        throw error;
      }
      await Listing.findOneAndUpdate(
        { _id: updatedReservation.listing, status: 'reserved', reservedBy: updatedReservation.buyer },
        { status: 'sold', soldAt: completedAt, $unset: { reservedBy: 1, reservedUntil: 1 } },
        { session }
      );
      await ItemJourney.create([{
        listing: updatedReservation.listing,
        reservation: updatedReservation._id,
        event: 'completed',
        actor: req.user._id
      }], { session });

      return updatedReservation;
    });

    res.json({ message: 'Handover confirmed', reservation: completed });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    res.status(500).json({ message: 'Handover confirmation failed' });
  }
});

module.exports = router;
module.exports.expireReservations = expireReservations;
module.exports.withTransaction = withTransaction;