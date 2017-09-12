module.exports = (triggerId, projectId, execute) => errors => errors === 1 && execute(`mutation {
  createNotification(
    kind: TRIGGER_DISABLED,
    triggerId: "${triggerId}",
    projectId: "${projectId}"
  ) {
    id
  }
}`)
