module.exports = (projectId, triggerId, from, to) => `query {
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
