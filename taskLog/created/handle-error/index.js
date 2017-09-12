const createQuery = require('./createQuery')
const request = require('./request')
const updateTriggerStatus = require('./updateTriggerStatus')

const date = shift => new Date(+new Date() - ((shift || 0) * 24 * 60 * 60 * 1000))
const extractTotalError = x => x.data._allTaskLogsMeta.count
const errorLimitReached = maxLimit => value => value >= maxLimit

module.exports = (context, callback) => {
  const trigger = context.body.data.TaskLog.node.trigger
  const projectId = trigger.project.id
  const authenticatedRequest = request({
    'content-type': 'application/json',
    'Authorization': `Bearer ${context.secrets.SECRET}`
  })
  const graphcoolQuery = authenticatedRequest(`https://api.graph.cool/simple/v1/${context.secrets.PROJECT_ID}`)

  Promise.resolve(createQuery(
    projectId,
    trigger.id,
    date(context.secrets.MAX_ERROR_DURATION),
    date())
  )
    .then(graphcoolQuery)
    .then(extractTotalError)
    .then(errorLimitReached(context.secrets.MAX_ERROR_COUNT))
    .then(updateTriggerStatus(trigger.id, graphcoolQuery))
    .then(x => callback(null, x))
    .catch(callback)
}
