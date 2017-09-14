module.exports = (triggerId, projectId, execute) => limitReached => limitReached
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
