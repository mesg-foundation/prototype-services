const sendgrid = require('sendgrid')
const Helpers = require('sendgrid').mail
const templates = require('./mails')
const fromEmail = new Helpers.Email('no-reply@etherstellar.com', 'EtherStellar')

const generateMail = data => {
  const { title, content } = templates[data.kind](data)
  return new Helpers.Mail(
    fromEmail,
    title,
    new Helpers.Email(data.project.users.map(x => x.email).join(';')),
    new Helpers.Content('text/plain', content)
  )
}

module.exports = (context, callback) => {
  const notification = context.body.data.Notification.node
  // notification.trigger.notifications[0]
  // is the one just created so we take the one just before
  const lastNotification = notification.trigger.notifications[1]
  const delay = context.secrets.NOTIFICATION_DELAY * 24 * 60 * 60 * 1000
  const lastNotificationDate = lastNotification
    ? +new Date(lastNotification.createdAt)
    : null
  if (lastNotificationDate && lastNotificationDate > +new Date() - delay) {
    callback(null, { status: 'NOTIFICATION_SENT_ALREADY' })
    return
  }
  const sendgridInstance = sendgrid(context.secrets.SENDGRID_SECRET)
  sendgridInstance.API(sendgridInstance.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: generateMail(notification).toJSON()
  }), callback)
}