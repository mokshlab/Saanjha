const fs = require('fs').promises;
const cloudinary = require('cloudinary').v2;

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
  && process.env.CLOUDINARY_API_KEY
  && process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

async function storeListingImages(files) {
  if (!cloudinaryConfigured) return files.map((file) => file.path);

  return Promise.all(files.map(async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: process.env.CLOUDINARY_FOLDER || 'saanjha/listings',
      resource_type: 'image'
    });
    await fs.unlink(file.path);
    return result.secure_url;
  }));
}

module.exports = { storeListingImages };