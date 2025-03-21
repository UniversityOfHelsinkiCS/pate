const express = require('express')
const morgan = require('morgan')
const { upload } = require('./src/attachments')
const { validationMiddleware, handleUploadErrors } = require('./src/middlewares')
const { PORT } = require('./src/config')
const { prepareMailsWithTemplate, parseSettings } = require('./src/pate')
const { sendEmails } = require('./src/mailer')
const logger = require('./src/logger')
const app = express()

// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
app.use(express.json({ limit: '50mb' }))

app.get('*', express.static('./public/'))

app.use(morgan('tiny'))

app.post('/preview', validationMiddleware, (req, res) => {
  const { emails, template, settings } = req.body

  const acualEmails = prepareMailsWithTemplate(emails, template, settings)

  const exampleMail = acualEmails[0]

  res.send({ html: exampleMail.html })
})

app.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Respond with the file ID (e.g., filename or path)
    const fileId = file.filename;
    logger.info(`Uploaded file: ${fileId}`);

    res.json({ fileId });
  });
}, handleUploadErrors);

app.post('*', validationMiddleware, (req, res) => {
  const { emails, template, settings } = req.body

  const acualEmails = prepareMailsWithTemplate(emails, template, settings)
  const { dryrun } = parseSettings(settings)

  sendEmails(acualEmails, dryrun);

  res.send('Payload accepted, check logs to see progress')
})

app.listen(PORT, () => {
  console.log(`Pate listening at http://localhost:${PORT}`)
})
