import { fromEvent } from 'graphcool-lib'

export default event => {
  const trigger = event.data.TaskLog.node.trigger
  const projectId = trigger.project.id
  const api = fromEvent(event).api('simple/v1')

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
