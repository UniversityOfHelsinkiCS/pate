const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const SAFE_FILENAME = /^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

// Ensure uploads directory exists
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (!SAFE_FILENAME.test(file.originalname)) {
    const err = new Error('File name contains disallowed characters');
    err.code = 'INVALID_FILENAME';
    return cb(err);
  }
  cb(null, true);
};

// Configure multer with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Allow only 1 file
  }
});

const createAttachment = (fileName) => {
  if (!fileName) {
    return null;
  }

  if (!SAFE_FILENAME.test(fileName)) {
    logger.warn(`Rejected unsafe attachment fileName: ${fileName}`);
    return null;
  }

  return {
    filename: fileName,
    content: fs.createReadStream(`/tmp/uploads/${fileName}`)
  };
};

const removeAttachment = (fileName) => {
  if (!fileName || !SAFE_FILENAME.test(fileName)) {
    return;
  }

  fs.unlink(path.join(uploadDir, fileName), (err) => {
    if (err && err.code !== 'ENOENT') {
      logger.warn(`Failed to remove attachment ${fileName}: ${err.message}`);
    }
  });
};

module.exports = {
  upload,
  createAttachment,
  removeAttachment,
  SAFE_FILENAME,
};
