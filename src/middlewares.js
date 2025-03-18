/**
 * Ensures all fields are filled. The "template" is used as the basis for all emails and the email details then would overwrite the fields in template.
 * Validation checks that whatever is not in template is defined in emails
 */
const validationMiddleware = (req, res, next) => {
  const REQUIRED_FIELDS = ["to", "subject", "text"];

  const { emails, template } = req.body;
  if (!Array.isArray(emails))
    return res.status(400).send("body.emails must be an array");
  if (!emails.length)
    return res.status(400).send("body.emails must have something in it");
  if (!template || typeof template !== "object")
    return res.status(400).send("body.template must be an object");

  let missingFields = REQUIRED_FIELDS;
  if (template)
    Object.keys(template).forEach(
      (key) => (missingFields = missingFields.filter((field) => field === key))
    );

  let isMissingFields = false;
  emails.forEach((emailRequest) => {
    missingFields.forEach((field) => {
      if (Object.keys(emailRequest).includes(field)) isMissingFields = true;
    });
  });

  if (isMissingFields)
    return res.status(400).send("does not contain all data to send mail");

  next();
};

// Custom error handler for multer upload errors
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File is too large' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field' });
    }
    if (err.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({ error: 'Too many parts' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
    if (err.code === 'ENOSPC') {
      return res.status(500).json({ error: 'Disk storage is full' });
    }
    // Generic error for other multer or upload-related issues
    return res.status(500).json({ error: `File upload error: ${err.message}` });
  }
  next();
};

module.exports = {
  validationMiddleware,
  handleUploadErrors,
};
