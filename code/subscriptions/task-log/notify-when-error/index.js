const fetch = require('isomorphic-fetch')

const request = headers => url => query => fetch(url, {
  headers,
  method: 'POST',
  body: JSON.stringify({ query })
})
  .then(x => x.json())


module.exports = event => {
  const trigger = event.data.TaskLog.node.trigger
  const projectId = trigger.project.id

  return fetch(`https://api.graph.cool/simple/v1/${process.env.GRAPHCOOL_PROJECT_ID}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.GRAPHCOOL_SECRET}`
    },
    body: JSON.stringify({
      query: `mutation {
        createNotification(
          kind: TRIGGER_ERROR,
          triggerId: "${trigger.id}",
          projectId: "${projectId}"
        ) {
          id
        }
      }`
    })
  })
    .then(x => x.json())
}
