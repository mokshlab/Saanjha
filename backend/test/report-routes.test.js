const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const test = require('node:test');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const app = require('../server');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const User = require('../models/User');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'report-route-test-secret';

let memoryServer;
let server;
let baseUrl;
let reporter;
let reportedUser;
let admin;
let reporterToken;
let adminToken;
let listing;

test.before(async () => {
  memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(memoryServer.getUri('saanjha-report-tests'));
  await Report.init();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

test.beforeEach(async () => {
  await Promise.all([
    Listing.deleteMany({}),
    Report.deleteMany({}),
    User.deleteMany({})
  ]);

  reporter = await User.create({
    name: 'Report Author',
    email: 'report-author@chitkara.edu.in',
    password: 'reportpass1',
    college: 'Test Campus'
  });
  reportedUser = await User.create({
    name: 'Reported Student',
    email: 'reported-student@chitkara.edu.in',
    password: 'reportedpass1',
    college: 'Test Campus'
  });
  admin = await User.create({
    name: 'Report Admin',
    email: 'report-admin@chitkara.edu.in',
    password: 'adminpass1',
    college: 'Test Campus',
    role: 'admin'
  });
  listing = await Listing.create({
    title: 'Reportable listing',
    description: 'A listing used by report tests',
    price: 0,
    category: 'books',
    condition: 'good',
    images: ['one.jpg', 'two.jpg'],
    seller: reportedUser._id,
    pickupPoint: 'Test point',
    status: 'approved'
  });

  reporterToken = jwt.sign({ userId: reporter._id }, process.env.JWT_SECRET);
  adminToken = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET);
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
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  return { status: response.status, body: await response.json() };
}

test('students can submit one open listing report and cannot duplicate it', async () => {
  const created = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'listing',
      listingId: listing._id,
      reason: 'misleading',
      details: 'The listing description does not match the item.'
    }
  });

  assert.equal(created.status, 201);
  assert.equal(created.body.report.status, 'open');
  assert.equal(String(created.body.report.listing), String(listing._id));

  const duplicate = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'listing',
      listingId: listing._id,
      reason: 'scam'
    }
  });
  assert.equal(duplicate.status, 409);

  const mine = await request('/reports/mine', { token: reporterToken });
  assert.equal(mine.status, 200);
  assert.equal(mine.body.reports.length, 1);
});

test('students can report another student but not themselves or their own listing', async () => {
  const userReport = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'user',
      userId: reportedUser._id,
      reason: 'harassment'
    }
  });
  assert.equal(userReport.status, 201);

  const selfReport = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'user',
      userId: reporter._id,
      reason: 'other'
    }
  });
  assert.equal(selfReport.status, 400);

  const ownListing = await Listing.create({
    title: 'Own listing',
    description: 'A listing owned by the reporter',
    price: 0,
    category: 'books',
    condition: 'good',
    images: ['one.jpg', 'two.jpg'],
    seller: reporter._id,
    pickupPoint: 'Test point',
    status: 'approved'
  });
  const ownListingReport = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'listing',
      listingId: ownListing._id,
      reason: 'other'
    }
  });
  assert.equal(ownListingReport.status, 400);
});

test('only admins can review reports and an open report can be resolved once', async () => {
  const created = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'user',
      userId: reportedUser._id,
      reason: 'inappropriate'
    }
  });

  const studentAccess = await request('/admin/reports', { token: reporterToken });
  assert.equal(studentAccess.status, 403);

  const invalidFilter = await request('/admin/reports?status=unknown', { token: adminToken });
  assert.equal(invalidFilter.status, 400);

  const openReports = await request('/admin/reports?status=open', { token: adminToken });
  assert.equal(openReports.status, 200);
  assert.equal(openReports.body.reports.length, 1);

  const resolved = await request(`/admin/reports/${created.body.report._id}`, {
    method: 'PATCH',
    token: adminToken,
    body: {
      status: 'resolved',
      resolutionNote: 'Reviewed and action recorded.'
    }
  });
  assert.equal(resolved.status, 200);
  assert.equal(resolved.body.report.status, 'resolved');
  assert.equal(resolved.body.report.reviewedBy.email, admin.email);

  const repeated = await request(`/admin/reports/${created.body.report._id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { status: 'rejected' }
  });
  assert.equal(repeated.status, 404);
});

test('report validation rejects invalid targets and reasons', async () => {
  const invalidReason = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'listing',
      listingId: listing._id,
      reason: 'not-a-reason'
    }
  });
  assert.equal(invalidReason.status, 400);

  const missingTarget = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'listing',
      reason: 'other'
    }
  });
  assert.equal(missingTarget.status, 400);

  const invalidListingId = await request('/reports', {
    method: 'POST',
    token: reporterToken,
    body: {
      targetType: 'listing',
      listingId: 'not-an-object-id',
      reason: 'other'
    }
  });
  assert.equal(invalidListingId.status, 400);

  const invalidAdminReportId = await request('/admin/reports/not-an-object-id', {
    method: 'PATCH',
    token: adminToken,
    body: { status: 'resolved' }
  });
  assert.equal(invalidAdminReportId.status, 400);

  const unauthenticated = await request('/reports', {
    method: 'POST',
    body: {
      targetType: 'listing',
      listingId: listing._id,
      reason: 'other'
    }
  });
  assert.equal(unauthenticated.status, 401);
});
