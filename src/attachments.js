import multer from 'multer'
import path from 'path'

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/uploads', // Directory to store uploaded files
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
})

module.exports = upload
