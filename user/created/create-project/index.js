const fetch = require('isomorphic-fetch')

const createProjectMutation = userId => `mutation {
  createProject(
    name: "Default Project",
    usersIds: [
      "${userId}"
    ]
  ) {
	  id
  }
}`

const request = headers => url => query => fetch(url, {
  headers,
  method: 'POST',
  body: JSON.stringify({ query })
})

module.exports = (context, callback) => {
  const authenticatedRequest = request({
    'content-type': 'application/json',
    'Authorization': `Bearer ${context.secrets.SECRET}`
  })
  return Promise
    .resolve(createProjectMutation(context.body.data.User.node.id))
    .then(authenticatedRequest(`https://api.graph.cool/simple/v1/${context.secrets.PROJECT_ID}`))
    .then(x => x.json())
    .then(x => callback(null, x))
}