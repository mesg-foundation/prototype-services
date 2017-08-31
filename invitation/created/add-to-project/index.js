const fetch = require('isomorphic-fetch')
const userQuery = require('./queries/userQuery')
const projectMutation = require('./queries/projectMutation')

const api = (endpoint, authorization) => query => fetch(endpoint, {
  headers: {
    'content-type': 'application/json',
    'Authorization': `Bearer ${authorization}`
  },
  method: 'POST',
  body: JSON.stringify({ query })
})

const reachLimit = project => project._usersMeta.count >= project.plan.members
const presentInTeam = (email, project) => !!project.users.find(x => x.email === email)

module.exports = (context, callback) => {
  const data = context.body.data.Invitation.node
  
  if (reachLimit(data.project)) { return callback(new Error('limit reached')) }
  if (presentInTeam(data.email, data.project)) { return callback(new Error('already in the team')) }

  const execute = api(`https://api.graph.cool/simple/v1/${context.secrets.PROJECT_ID}`, context.secrets.SECRET)

  return execute(userQuery(data.email))
    .then(x => x.json())
    .then(x => x.data.User)
    .then(user => execute(projectMutation(user.id, data.project.id)))
    .then(x => x.json())
    .then(x => callback(null, x))
    .catch(callback)
}
