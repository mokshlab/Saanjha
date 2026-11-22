
const fs = require('fs').promises;
const path = require('path');
const cloudinary = require('cloudinary').v2;

const maxVideoDurationSeconds = 90;
const maxVideoBytes = 80 * 1024 * 1024;

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

async function storeListingImages(files) {
  if (!isCloudinaryConfigured()) {
    return files.map((file) => (
      `/uploads/listings/${path.basename(file.path)}`
    ));
  }

  return Promise.all(files.map(async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: process.env.CLOUDINARY_FOLDER || 'saanjha/listings',
      resource_type: 'image'
    });

    await fs.unlink(file.path);
    return result.secure_url;
  }));
}

async function removeLocalFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function removeStoredVideo(video) {
  if (!video?.publicId || !isCloudinaryConfigured()) return;
  await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
}

async function storeListingVideo(file) {
  if (!isCloudinaryConfigured()) {
    await removeLocalFile(file.path);
    const error = new Error('Video upload requires Cloudinary storage to be configured');
    error.statusCode = 503;
    throw error;
  }

  let uploaded;
  try {
    uploaded = await cloudinary.uploader.upload(file.path, {
      folder: process.env.CLOUDINARY_FOLDER || 'saanjha/listings',
      resource_type: 'video'
    });

    const durationSeconds = Number(uploaded.duration);
    const bytes = Number(uploaded.bytes);
    if (!Number.isFinite(durationSeconds) || durationSeconds > maxVideoDurationSeconds) {
      const error = new Error('Video duration must be 90 seconds or less');
      error.statusCode = 400;
      throw error;
    }
    if (!Number.isFinite(bytes) || bytes > maxVideoBytes) {
      const error = new Error('Video file must be 80MB or less');
      error.statusCode = 400;
      throw error;
    }

    return {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      durationSeconds,
      bytes,
      format: uploaded.format
    };
  } catch (error) {
    if (uploaded?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'video' });
      } catch (cleanupError) {
        error.message = `${error.message}; Cloudinary cleanup failed: ${cleanupError.message}`;
      }
    }
    throw error;
  } finally {
    await removeLocalFile(file.path);
  }
}

module.exports = {
  storeListingImages,
  storeListingVideo,
  isCloudinaryConfigured,
  removeLocalFile,
  removeStoredVideo
};
