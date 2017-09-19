const fetch = require('isomorphic-fetch')
const freePlanQuery = () => `query {
  allPlans(
    first: 1, 
    filter: {
      price: 0
    }
  ) {
    id
  }
}`

const assignPlanQuery = (projectId, planId) => `mutation {
  addToProjectOnPlan(
    planPlanId: "${planId}",
    projectsProjectId: "${projectId}"
  ) {
    planPlan {
      id
    }
  }
}`

const api = (endpoint, secret) => query => fetch(endpoint, {
  headers: {
    'content-type': 'application/json',
    'Authorization': `Bearer ${secret}`
  },
  method: 'POST',
  body: JSON.stringify({ query })
})

module.exports = event => {
  const execute = api(`https://api.graph.cool/simple/v1/${process.env.GRAPHCOOL_PROJECT_ID}`, process.env.GRAPHCOOL_SECRET)
  const project = event.data.Project.node

  if (project.plan && project.plan.id) { return callback(new Error(`This project already have a plan`)) }

  execute(freePlanQuery())
    .then(x => x.json())
    .then(x => x.data.allPlans[0].id)
    .then(x => execute(assignPlanQuery(project.id, x)))
    .then(x => x.json())
}