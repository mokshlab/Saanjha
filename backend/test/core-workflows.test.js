const assert = require('node:assert/strict');
const test = require('node:test');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { requiresApprovalChange } = require('../services/listingRules');
const { getPasswordError } = require('../services/passwordRules');
const { generateOtp } = require('../services/otp');

const listingData = {
  title: 'Test item',
  description: 'A test listing',
  price: 0,
  category: 'other',
  condition: 'good',
  images: ['one.jpg', 'two.jpg'],
  seller: '507f1f77bcf86cd799439011',
  pickupPoint: 'Main campus'
};

test('listing requires at least two images', async () => {
  const listing = new Listing({ ...listingData, images: ['one.jpg'] });
  await assert.rejects(listing.validate(), /At least two images are required/);
});

test('approval-sensitive listing edits are detected', () => {
  const listing = new Listing(listingData);
  assert.equal(requiresApprovalChange(listing, { description: 'Corrected text' }, false), false);
  assert.equal(requiresApprovalChange(listing, { title: 'Changed title' }, false), true);
  assert.equal(requiresApprovalChange(listing, {}, true), true);
});

test('new passwords require eight characters, a letter, and a number', async () => {
  assert.match(getPasswordError('password'), /at least 8 characters/);
  assert.match(getPasswordError('12345678'), /at least 8 characters/);
  assert.equal(getPasswordError('password1'), null);
  await assert.doesNotReject(
    new User({
      name: 'Test Student',
      email: 'password-test-valid@example.com',
      password: 'password1',
      college: 'Test College'
    }).validate()
  );
});

test('verification codes contain four digits', () => {
  const { code } = generateOtp();
  assert.match(code, /^\d{4}$/);
});

