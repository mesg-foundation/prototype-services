module.exports = (userId, projectId) => `mutation {
  addToProjectOnUser(
    usersUserId: "${userId}",
    projectsProjectId: "${projectId}"
  ) {
    projectsProject {
      id
    }
    usersUser {
      id
    }
  }
}`
