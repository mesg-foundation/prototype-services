const fromEvent = require('graphcool-lib').fromEvent

module.exports = event => {
  const trigger = event.data.TaskLog.node.trigger
  const projectId = trigger.project.id
  const api = fromEvent(event, { token: event.context.graphcool.rootToken }).api('simple/v1')

  return api.request(`mutation {
    createNotification(
      kind: TRIGGER_ERROR,
      triggerId: "${trigger.id}",
      projectId: "${projectId}"
    ) {
      id
    }
  }`)
}
