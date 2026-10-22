const express = require('express');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const ItemJourney = require('../models/ItemJourney');
const { auth, studentAuth } = require('../middleware/auth');

const router = express.Router();
const durationOptions = [3, 6, 12, 24, 36, 54, 72, 96];

router.post('/:listingId', auth, studentAuth, async (req, res) => {
  const durationHours = Number(req.body.durationHours || 54);
  if (!durationOptions.includes(durationHours)) {
    return res.status(400).json({ message: 'Choose a valid reservation duration' });
  }

  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
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
      expiresAt
    });
    await ItemJourney.create({ listing: listing._id, reservation: reservation._id, event: 'reserved', actor: req.user._id });
    res.status(201).json({ message: 'Listing reserved', reservation });
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

module.exports = router;