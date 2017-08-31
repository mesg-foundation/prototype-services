module.exports = (projectId, planId) => `mutation {
  addToProjectOnPlan(
    planPlanId: "${planId}",
    projectsProjectId: "${projectId}"
  ) {
    planPlan {
      id
    }
  }
}`
