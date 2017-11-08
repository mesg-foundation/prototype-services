const Sendgrid = require("sendgrid")
const flat = require("flat")

const textTransform = variables => text => Object.keys(variables)
  .reduce((prevText, variableKey) => {
    return prevText.replace(new RegExp(`{{ ?${variableKey} ?}}`, 'g'), variables[variableKey])
  }, text)

export default event => new Promise((resolve, reject) => {
  const meta = event.meta
  delete event.meta
  const transform = textTransform(flat(event))
  const mail = new Sendgrid.mail.Mail(
    new Sendgrid.mail.Email(transform(meta.from)),
    transform(meta.subject),
    new Sendgrid.mail.Email(transform(meta.to)),
    new Sendgrid.mail.Content('text/plain', transform(meta.body))
  )
  const sg = Sendgrid(meta.secret)
  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  })
  return sg.API(request, (err, res) => err ? reject(err) : resolve(res))
})
