const assert = require('node:assert/strict');
const test = require('node:test');
const Listing = require('../models/Listing');
const { requiresApprovalChange } = require('../services/listingRules');

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

