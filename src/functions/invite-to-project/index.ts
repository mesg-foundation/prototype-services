import { fromEvent } from 'graphcool-lib'

interface User {
  id: string
}

const userQuery = email => `query {
  User(email: "${email}") {
    id
  }
}`

const projectMutation = (userId, projectId) => `mutation {
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

// const reachLimit = project => !project._usersMeta.count || project._usersMeta.count >= project.plan.members
const presentInTeam = (email, project) => !!project.users.find(x => x.email === email)

export default event => {
  const data = event.data.Invitation.node

  // if (reachLimit(data.project)) { return callback(new Error('limit reached')) }
  const api = fromEvent(event).api('simple/v1')
  return presentInTeam(data.email, data.project)
    ? Promise.resolve({ error: 'ALREADY_IN_TEAM' })
    : api.request<{ User: User }>(userQuery(data.email))
      .then(x => x.User)
      .then(user => user
        ? api.request(projectMutation(user.id, data.project.id))
        : { error: 'USER_NOT_EXISTS' }
      )
}
