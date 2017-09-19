const fetch = require('isomorphic-fetch')

const createQuery = (projectId, triggerId, from, to) => `query {
  _allTaskLogsMeta(filter: {
    createdAt_gt: "${from.toISOString()}",
    createdAt_lt: "${to.toISOString()}",
    code_not_starts_with: "20",
    trigger: {
      id: "${triggerId}"
      project: {
        id: "${projectId}"
      }
    }
  }) {
    count
  }
}`

const request = headers => url => query => fetch(url, {
  headers,
  method: 'POST',
  body: JSON.stringify({ query })
})
  .then(x => x.json())

const updateTriggerStatus = (triggerId, projectId, execute) => limitReached => limitReached
  ? execute(`mutation {
    updateTrigger(
      id: "${triggerId}",
      enable: false
    ) {
      id
    }
    createNotification(
      kind: TRIGGER_DISABLED,
      triggerId: "${triggerId}",
      projectId: "${projectId}"
    ) {
      id
    }
  }`)
  : Promise.resolve({})


const date = shift => new Date(+new Date() - ((shift || 0) * 24 * 60 * 60 * 1000))
const extractTotalError = x => x.data._allTaskLogsMeta.count
const errorLimitReached = maxLimit => value => value >= maxLimit

module.exports = event => {
  const trigger = event.data.TaskLog.node.trigger
  const projectId = trigger.project.id
  const authenticatedRequest = request({
    'content-type': 'application/json',
    'Authorization': `Bearer ${process.env.GRAPHCOOL_SECRET}`
  })
  const graphcoolQuery = authenticatedRequest(`https://api.graph.cool/simple/v1/${process.env.GRAPHCOOL_PROJECT_ID}`)

  return Promise.resolve(createQuery(
    projectId,
    trigger.id,
    date(process.env.MAX_ERROR_DURATION),
    date())
  )
    .then(graphcoolQuery)
    .then(extractTotalError)
    .then(errorLimitReached(process.env.MAX_ERROR_COUNT))
    .then(updateTriggerStatus(trigger.id, projectId, graphcoolQuery))
}
