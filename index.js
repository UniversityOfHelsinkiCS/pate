const express = require('express')
const { PORT, TOKEN } = require('./src/config')
const youHaveNewMail = require('./src/pate')
const app = express()

const requiredFields = ['to', 'subject', 'text']

app.use(express.json())

app.get('*', express.static('./public/'))

app.use((req, res, next) => {
  if (!TOKEN) return next()

  if (req.query.token !== TOKEN && req.headers['token'] !== TOKEN) {
    logger.error({ message: `No token ${req.query.token}, ${req.headers['token']}` })

    return res.sendStatus(401)
  }

  next()
})

/**
 * Validate that the req.template and req.body have all the required fields
 */
app.post('*', (req, res, next) => {
  const { emails, template } = req.body
  if (!Array.isArray(emails)) return res.status(400).send('body.emails must be an array')
  if (!template || typeof template !== 'object') return res.status(400).send('body.template must be an object')

  let missingFields = requiredFields
  if (template) Object.keys(template).forEach(key => missingFields = missingFields.filter(field => field === key))

  let isMissingFields = false
  emails.forEach(emailRequest => {
    missingFields.forEach(field => {
      if (Object.keys(emailRequest).includes(field)) isMissingFields = true
    })
  });
  
  if (isMissingFields) return res.status(400).send('does not contain all data to send mail') 

  next()
})

app.post('*', (req, res) => {
  const { emails, template, settings } = req.body

  youHaveNewMail(emails, template, settings)

  res.send('Payload accepted, check logs to see progress')
})

app.listen(PORT, () => {
  console.log(`Pate listening at http://localhost:${PORT}`)
})