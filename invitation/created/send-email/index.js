const sendgrid = require('sendgrid')
const Helpers = require('sendgrid').mail

const fromEmail = new Helpers.Email('no-reply@etherstellar.com', 'EtherStellar')
const title = data => `You've been invited to the ${data.project.name} project`
const content = data => `[${data.project.name}]... go to your dashboard... ${data.id}`

const generateMail = data => new Helpers.Mail(
  fromEmail,
  title(data),
  new Helpers.Email(data.email),
  new Helpers.Content('text/plain', content(data))
)

const request = mail => sendgrid.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON()
})

module.exports = (context, callback) => {
  const email = generateMail(context.body.data.Invitation.node)
  sendgrid(context.secrets.SENDGRID_SECRET)
    .API(email, callback)
  }