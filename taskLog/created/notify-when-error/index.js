const request = require('./request')

module.exports = (context, callback) => {
  const trigger = context.body.data.TaskLog.node.trigger
  const projectId = trigger.project.id
  const authenticatedRequest = request({
    'content-type': 'application/json',
    'Authorization': `Bearer ${context.secrets.SECRET}`
  })
  const graphcoolQuery = authenticatedRequest(`https://api.graph.cool/simple/v1/${context.secrets.PROJECT_ID}`)
  graphcoolQuery(`mutation {
    createNotification(
      kind: TRIGGER_ERROR,
      triggerId: "${trigger.id}",
      projectId: "${projectId}"
    ) {
      id
    }
  }`)
    .then(x => callback(null, x))
    .catch(callback)
}
