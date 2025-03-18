const multer = require('multer')

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads', // Directory to store uploaded files
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
})

const createAttachment = (fileName) => {
  if (!fileName) {
    return null
  }

  return {
    filename: fileName,
    url: `/tmp/uploads/${fileName}`,
  }
}

module.exports = {
  upload,
  createAttachment,
}
