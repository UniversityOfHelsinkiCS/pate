const nodemailer = require('nodemailer')
const logger = require('./logger')
const { TRANSPORT_DEFAULTS, TRANSPORT_SETTINGS } = require('./config')

const transport = nodemailer.createTransport(
  TRANSPORT_SETTINGS,
  TRANSPORT_DEFAULTS,
)

const pause = (ms) => new Promise((res) => setTimeout(() => res(), ms))

const sendEmails = async (emails, dryrun) => {
  logger.info(`Starting to send mail to ${emails.length} recipient(s)`)
  for (const email of emails) {
    if (dryrun) {
      logger.info(`Dry run enabled, would have sent mail to ${email.to}`, { to: email.to, subject: email.subject, text: email.text })
      continue;
    }

    try {
      await transport.sendMail(email)
      logger.info(`Sent mail to ${email.to}`, { to: email.to, subject: email.subject, text: email.text })
    } catch (err) {
      logger.error(`Failed to send mail to ${email.to}`, { to: email.to, subject: email.subject, text: email.text })
    }
    await pause(500)
  }
  logger.info(`Sent mail to ${emails.length} recipient(s)`)
}

module.exports = sendEmails
