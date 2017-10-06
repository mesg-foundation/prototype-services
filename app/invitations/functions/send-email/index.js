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

module.exports = event => {
  const sendgridInstance = sendgrid(process.env.SENDGRID_SECRET)
  return sendgridInstance
    .API(sendgridInstance.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: generateMail(event.data.Invitation.node).toJSON()
    }))
}