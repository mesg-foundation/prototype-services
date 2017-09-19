const fetch = require('isomorphic-fetch')

const userQuery = email => `query {
  User(email: "${email}") {
    id
  }
}`

const projectMutation = (userId, projectId) => `mutation {
  addToProjectOnUser(
    usersUserId: "${userId}",
    projectsProjectId: "${projectId}"
  ) {
    projectsProject {
      id
    }
    usersUser {
      id
    }
  }
}`

const api = (endpoint, authorization) => query => fetch(endpoint, {
  headers: {
    'content-type': 'application/json',
    'Authorization': `Bearer ${authorization}`
  },
  method: 'POST',
  body: JSON.stringify({ query })
})

// const reachLimit = project => !project._usersMeta.count || project._usersMeta.count >= project.plan.members
const presentInTeam = (email, project) => !!project.users.find(x => x.email === email)

module.exports = event => {
  const data = event.data.Invitation.node
  
  // if (reachLimit(data.project)) { return callback(new Error('limit reached')) }

  const execute = api(`https://api.graph.cool/simple/v1/${process.env.GRAPHCOOL_PROJECT_ID}`, process.env.GRAPHCOOL_SECRET)

  return presentInTeam(data.email, data.project)
    ? Promise.resolve({ error: 'ALREADY_IN_TEAM' })
    : execute(userQuery(data.email))
      .then(x => x.json())
      .then(x => x.data.User)
      .then(user => execute(projectMutation(user.id, data.project.id)))
      .then(x => x.json())
}
