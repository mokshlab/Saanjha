const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const test = require('node:test');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('../server');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const ItemJourney = require('../models/ItemJourney');
const User = require('../models/User');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'route-test-secret';

let memoryServer;
let server;
let baseUrl;
let seller;
let buyer;
let sellerToken;
let buyerToken;

test.before(async () => {
  memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(memoryServer.getUri('saanjha-route-tests'));
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

test.beforeEach(async () => {
  await Promise.all([
    Listing.deleteMany({}),
    Reservation.deleteMany({}),
    Notification.deleteMany({}),
    ItemJourney.deleteMany({}),
    User.deleteMany({}),
  ]);

  seller = await User.create({
    name: 'Route Seller',
    email: 'route-seller@chitkara.edu.in',
    password: 'sellerpass1',
    college: 'Test Campus',
  });
  buyer = await User.create({
    name: 'Route Buyer',
    email: 'route-buyer@chitkara.edu.in',
    password: 'buyerpass1',
    college: 'Test Campus',
  });
  sellerToken = jwt.sign({ userId: seller._id }, process.env.JWT_SECRET);
  buyerToken = jwt.sign({ userId: buyer._id }, process.env.JWT_SECRET);
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  await memoryServer.stop();
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const body = await response.json();
  return { status: response.status, body };
}

async function createApprovedListing(overrides = {}) {
  return Listing.create({
    title: 'Route test listing',
    description: 'A listing for route integration tests',
    price: 0,
    category: 'books',
    condition: 'good',
    images: ['one.jpg', 'two.jpg'],
    seller: seller._id,
    pickupPoint: 'Test point',
    status: 'approved',
    ...overrides,
  });
}

test('reservation routes create, list, and reject unauthenticated access', async () => {
  const listing = await createApprovedListing();

  const unauthorized = await request(`/reservations/mine`);
  assert.equal(unauthorized.status, 401);

  const created = await request(`/reservations/${listing._id}`, {
    method: 'POST',
    token: buyerToken,
    body: { durationHours: 3 },
  });
  assert.equal(created.status, 201);
  assert.match(created.body.handoverCode, /^\d{4}$/);
  assert.equal(created.body.reservation.status, 'active');

  const duplicate = await request(`/reservations/${listing._id}`, {
    method: 'POST',
    token: buyerToken,
    body: { durationHours: 3 },
  });
  assert.equal(duplicate.status, 409);

  const mine = await request('/reservations/mine', { token: buyerToken });
  assert.equal(mine.status, 200);
  assert.equal(mine.body.reservations.length, 1);
  assert.equal(String(mine.body.reservations[0].listing._id), String(listing._id));
});

test('reservation routes cancel and notify the other participant', async () => {
  const listing = await createApprovedListing();
  const created = await request(`/reservations/${listing._id}`, {
    method: 'POST',
    token: buyerToken,
    body: { durationHours: 3 },
  });

  const cancelled = await request(
    `/reservations/${created.body.reservation._id}/cancel`,
    { method: 'POST', token: buyerToken }
  );
  assert.equal(cancelled.status, 200);

  const releasedListing = await Listing.findById(listing._id);
  assert.equal(releasedListing.status, 'approved');
  const notification = await Notification.findOne({
    reservation: created.body.reservation._id,
    recipient: seller._id,
    type: 'cancelled',
  });
  assert.ok(notification);
});

test('seller route completes handover and marks listing sold', async () => {
  const listing = await createApprovedListing();
  const created = await request(`/reservations/${listing._id}`, {
    method: 'POST',
    token: buyerToken,
    body: { durationHours: 3 },
  });

  const sellerReservations = await request('/reservations/seller/active', {
    token: sellerToken,
  });
  assert.equal(sellerReservations.status, 200);
  assert.equal(sellerReservations.body.reservations.length, 1);

  const completed = await request(
    `/reservations/${created.body.reservation._id}/handover`,
    {
      method: 'POST',
      token: sellerToken,
      body: { code: created.body.handoverCode },
    }
  );
  assert.equal(completed.status, 200);
  assert.equal(completed.body.reservation.status, 'completed');

  const soldListing = await Listing.findById(listing._id);
  assert.equal(soldListing.status, 'sold');
  assert.ok(await ItemJourney.findOne({
    reservation: created.body.reservation._id,
    event: 'completed',
  }));
});

test('reservation routes expire records and expose notifications', async () => {
  const listing = await createApprovedListing({
    status: 'reserved',
    reservedBy: buyer._id,
    reservedUntil: new Date(Date.now() - 1000),
  });
  const reservation = await Reservation.create({
    listing: listing._id,
    buyer: buyer._id,
    seller: seller._id,
    durationHours: 3,
    expiresAt: new Date(Date.now() - 1000),
  });

  const notifications = await request('/reservations/notifications', {
    token: buyerToken,
  });
  assert.equal(notifications.status, 200);
  assert.equal(notifications.body.notifications.length, 1);
  assert.equal(notifications.body.notifications[0].type, 'expired');

  const expired = await Reservation.findById(reservation._id);
  const releasedListing = await Listing.findById(listing._id);
  assert.equal(expired.status, 'expired');
  assert.equal(releasedListing.status, 'approved');
});

test('OTP verification blocks repeated invalid codes', async () => {
  const user = await User.create({
    name: 'OTP Test User',
    email: 'otp-test@chitkara.edu.in',
    password: 'otppass1',
    college: 'Test Campus',
    otpCodeHash: await bcrypt.hash('4821', 10),
    otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request('/auth/verify-otp', {
      method: 'POST',
      body: { email: user.email, code: '1234' },
    });
    assert.equal(response.status, 401);
  }

  const blocked = await request('/auth/verify-otp', {
    method: 'POST',
    body: { email: user.email, code: '4821' },
  });
  assert.equal(blocked.status, 429);
});
