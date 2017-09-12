const sendgrid = require('sendgrid')
const Helpers = require('sendgrid').mail
const fromEmail = new Helpers.Email('no-reply@etherstellar.com', 'EtherStellar')

const title = data => ({
  TRIGGER_DISABLED: "A trigger has been desactivated",
  TRIGGER_ERROR: "Your trigger fails"
}[data.kind])

const content = data => ({
  TRIGGER_DISABLED: `The trigger ${data.trigger.id} as been desactivated`,
  TRIGGER_ERROR: `The trigger ${data.trigger.id} fails to execute, please check the details on your dashboard`
}[data.kind])

const generateMail = data => new Helpers.Mail(
  fromEmail,
  title(data),
  new Helpers.Email(data.project.users.map(x => x.email).join(';')),
  new Helpers.Content('text/plain', content(data))
)

module.exports = (context, callback) => {
  const sendgridInstance = sendgrid(context.secrets.SENDGRID_SECRET)
  sendgridInstance.API(sendgridInstance.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: generateMail(context.body.data.Notification.node).toJSON()
  }), callback)
}