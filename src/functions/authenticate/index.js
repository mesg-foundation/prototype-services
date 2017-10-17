const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

function getGraphcoolUser(api, email) {
  return api.request(`
    query {
      User(email: "${email}"){
        id
        password
      }
    }`)
    .then((userQueryResult) => {
      if (userQueryResult.error) {
        return Promise.reject(userQueryResult.error)
      } else {
        return userQueryResult.User
      }
    })
}

module.exports = function(event) {
  if (!event.context.graphcool.pat) {
    console.log('Please provide a valid root token!')
    return { error: 'Email Authentication not configured correctly.'}
  }

  const email = event.data.email
  const password = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  return getGraphcoolUser(api, email)
    .then(graphcoolUser => graphcoolUser === null
      ? Promise.reject('Invalid Credentials')
      : bcrypt.compare(password, graphcoolUser.password)
          .then(passwordCorrect => passwordCorrect ? graphcoolUser.id : Promise.reject('Invalid Credentials'))
          .then(graphcoolUserId => graphcool.generateAuthToken(graphcoolUserId, 'User'))
          .then(token => ({
            data: {
              token
            }
          }))
    )
    .catch(error => ({ error }))
}
