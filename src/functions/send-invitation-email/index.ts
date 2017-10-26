import * as Sendgrid from 'sendgrid'
const fromEmail = new Sendgrid.mail.Email('no-reply@etherstellar.com', 'EtherStellar')

const title = data => `You've been invited to the ${data.project.name} project`
const content = data => `[${data.project.name}]... go to your dashboard... ${data.id}`

const generateMail = data => new Sendgrid.mail.Mail(
  fromEmail,
  title(data),
  new Sendgrid.mail.Email(data.email),
  new Sendgrid.mail.Content('text/plain', content(data))
)

export default event => {
  const sendgridInstance = Sendgrid(process.env.SENDGRID_SECRET || '')
  return sendgridInstance
    .API(sendgridInstance.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: generateMail(event.data.Invitation.node).toJSON()
    }))
}
