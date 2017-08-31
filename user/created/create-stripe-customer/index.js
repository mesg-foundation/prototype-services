const stripe = require('stripe')
const fetch = require('isomorphic-fetch')
const updateStripeUserQuery = require('./queries/updateStripeUserQuery')

const request = headers => url => query => fetch(url, {
  headers,
  method: 'POST',
  body: JSON.stringify({ query })
}).then(x => x.json())

module.exports = (context, callback) => {
  const user = context.body.data.User.node
  const authenticatedRequest = request({
    'content-type': 'application/json',
    'Authorization': `Bearer ${context.secrets.SECRET}`
  })
  stripe(context.secrets.STRIPE_SECRET)
    .customers
    .create({
      email: user.email
    })
    .then(updateStripeUserQuery(user.id))
    .then(authenticatedRequest(`https://api.graph.cool/simple/v1/${context.secrets.PROJECT_ID}`))
    .then(x => callback(null, x))
    .catch(callback)
}