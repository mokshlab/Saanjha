
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '..', 'uploads', 'listings');

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
};

const videoFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.mp4', '.webm', '.mov', '.m4v'];
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension) && allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error('Only MP4, WebM, MOV, and M4V video files are allowed!'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 10
  },
  fileFilter
});

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024,
    files: 1
  },
  fileFilter: videoFileFilter
});

const handleUploadError = (error, req, res, next, maxFileSize = '5MB') => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: `File too large. Maximum size allowed is ${maxFileSize}.` });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 10 files allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name for file upload.' });
    }
  }

  if (error.message?.includes('Only image files') ||
    error.message?.includes('Only MP4')) {
    return res.status(400).json({ message: error.message });
  }

  next(error);
};

const uploadSingle = (fieldName) => [
  upload.single(fieldName),
  handleUploadError
];

const uploadMultiple = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  handleUploadError
];

const uploadFields = (fields) => [
  upload.fields(fields),
  handleUploadError
];

const uploadVideo = (fieldName = 'video') => [
  videoUpload.single(fieldName),
  (error, req, res, next) => handleUploadError(error, req, res, next, '80MB')
];

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadVideo,
  handleUploadError
};
