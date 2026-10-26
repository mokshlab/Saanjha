const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const test = require('node:test');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const ItemJourney = require('../models/ItemJourney');
const { expireReservations } = require('../routes/reservations');

let memoryServer;

test.before(async () => {
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri('saanjha-reservation-tests'));
  await Promise.all([
    Listing.init(),
    Reservation.init(),
    Notification.init(),
    ItemJourney.init(),
  ]);
});

test.beforeEach(async () => {
  await Promise.all([
    Listing.deleteMany({}),
    Reservation.deleteMany({}),
    Notification.deleteMany({}),
    ItemJourney.deleteMany({}),
  ]);
});

test.after(async () => {
  await mongoose.disconnect();
  await memoryServer.stop();
});

function reservationData(overrides = {}) {
  const seller = new mongoose.Types.ObjectId();
  const buyer = new mongoose.Types.ObjectId();
  return {
    listing: new mongoose.Types.ObjectId(),
    buyer,
    seller,
    durationHours: 54,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    ...overrides,
  };
}

test('reservation accepts configured durations and rejects unsupported values', async () => {
  await assert.doesNotReject(new Reservation(reservationData()).validate());
  await assert.rejects(
    new Reservation(reservationData({ durationHours: 5 })).validate(),
    /is not a valid enum value/
  );
});

test('active reservation indexes prevent duplicate listing and buyer reservations', async () => {
  const listing = new mongoose.Types.ObjectId();
  const first = reservationData({ listing });
  await Reservation.create(first);

  await assert.rejects(
    Reservation.create(reservationData({ listing })),
    (error) => error.code === 11000
  );

  const secondListing = new mongoose.Types.ObjectId();
  await assert.rejects(
    Reservation.create(reservationData({ listing: secondListing, buyer: first.buyer })),
    (error) => error.code === 11000
  );
});

test('handover code verification uses a stored hash', async () => {
  const reservation = new Reservation(reservationData({ handoverCodeHash: await bcrypt.hash('4821', 10) }));
  assert.equal(await reservation.verifyHandoverCode('4821'), true);
  assert.equal(await reservation.verifyHandoverCode('1234'), false);
});

test('expiry releases the listing and records journey and notification', async () => {
  const data = reservationData({ expiresAt: new Date(Date.now() - 1000) });
  await Listing.create({
    _id: data.listing,
    title: 'Expiring item',
    description: 'Test listing',
    price: 0,
    category: 'books',
    condition: 'good',
    images: ['one.jpg', 'two.jpg'],
    seller: data.seller,
    pickupPoint: 'Test point',
    status: 'reserved',
    reservedBy: data.buyer,
    reservedUntil: data.expiresAt,
  });
  const reservation = await Reservation.create(data);

  await expireReservations();

  const releasedListing = await Listing.findById(data.listing);
  const expiredReservation = await Reservation.findById(reservation._id);
  const journey = await ItemJourney.findOne({ reservation: reservation._id, event: 'expired' });
  const notification = await Notification.findOne({ reservation: reservation._id, type: 'expired' });

  assert.equal(releasedListing.status, 'approved');
  assert.equal(releasedListing.reservedBy, undefined);
  assert.equal(expiredReservation.status, 'expired');
  assert.ok(journey);
  assert.ok(notification);
});
