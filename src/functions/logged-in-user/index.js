const fromEvent = require('graphcool-lib').fromEvent

function getUser(api, userId) {
  return api.request(`
    query {
      User(id: "${userId}") {
        id
      }
    }`)
    .then(userQueryResult => userQueryResult.User)
    .catch(error => {
      // Log error but don't expose to caller
      console.log(error)
      return { error: `An unexpected error occured` }
    })
}

module.exports = function loggedInUser(event) {

  if (!event.context.auth || !event.context.auth.nodeId) {
    return {data: {id: null}}
  }

  const userId = event.context.auth.nodeId
  const graphcool = fromEvent(event, { token: event.context.graphcool.rootToken })
  const api = graphcool.api('simple/v1')

  return getUser(api, userId)
    .then(user => user ? { data: user } : Promise.reject(`No user with id ${userId}`))
    .catch(error => ({ error: error.message || error }))
}