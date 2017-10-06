const fromEvent = require('graphcool-lib').fromEvent

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

const updateTriggerStatus = (triggerId, projectId, api) => limitReached => limitReached
  ? api.request(`mutation {
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
  : Promise.resolve({ error: 'LIMIT_NOT_REACHED' })


const date = shift => new Date(+new Date() - ((shift || 0) * 24 * 60 * 60 * 1000))
const extractTotalError = x => x._allTaskLogsMeta.count
const errorLimitReached = maxLimit => value => value >= maxLimit

module.exports = event => {
  const trigger = event.data.TaskLog.node.trigger
  const projectId = trigger.project.id
  const api = fromEvent(event).api('simple/v1')
  return api.request(createQuery(
    projectId,
    trigger.id,
    date(process.env.MAX_ERROR_DURATION),
    date())
  )
    .then(extractTotalError)
    .then(errorLimitReached(process.env.MAX_ERROR_COUNT))
    .then(updateTriggerStatus(trigger.id, projectId, api))
}
