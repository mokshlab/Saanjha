const approvalFields = ['title', 'category', 'condition', 'images'];

function requiresApprovalChange(currentListing, changes, replacingImages) {
  return approvalFields.some((field) => {
    if (field === 'images') return replacingImages;
    return changes[field] !== undefined && String(changes[field]) !== String(currentListing[field]);
  });
}

module.exports = { requiresApprovalChange };