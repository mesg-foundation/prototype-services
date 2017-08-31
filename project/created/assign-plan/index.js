const fetch = require('isomorphic-fetch')
const freePlanQuery = require('./queries/freePlanQuery')
const assignPlanQuery = require('./queries/assignPlanQuery')

const api = (endpoint, secret) => query => fetch(endpoint, {
  headers: {
    'content-type': 'application/json',
    'Authorization': `Bearer ${secret}`
  },
  method: 'POST',
  body: JSON.stringify({ query })
})

module.exports = (context, callback) => {
  const execute = api(`https://api.graph.cool/simple/v1/${context.secrets.PROJECT_ID}`, context.secrets.SECRET)
  const project = context.body.data.Project.node

  if (project.plan && project.plan.id) { return callback(new Error(`This project already have a plan`)) }

  execute(freePlanQuery())
    .then(x => x.json())
    .then(x => x.data.allPlans[0].id)
    .then(x => execute(assignPlanQuery(project.id, x)))
    .then(x => x.json())
    .then(x => callback(null, x))
    .catch(callback)
}