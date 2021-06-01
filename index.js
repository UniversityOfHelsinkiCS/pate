const express = require('express')
const { tokenMiddleware, validationMiddleware } = require('./src/middlewares')
const { PORT } = require('./src/config')
const { prepareMailsWithTemplate, parseSettings } = require('./src/pate')
const { sendEmails } = require('./src/mailer')
const app = express()

app.use(express.json())

app.get('*', express.static('./public/'))

app.use(tokenMiddleware)

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