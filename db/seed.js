const { GraphQLClient } = require('graphql-request')

const projectId = process.argv[2]
const token = process.argv[3]

if (!projectId || !token) {
  console.log('ERROR: Command should contains the project id and the authentication token')
  console.log()
  console.log('> yarn db:seed __PROJECT_ID__ __AUTH_TOKEN__')
  console.log()
  process.exit(0)
}

const client = new GraphQLClient(`https://api.graph.cool/simple/v1/${projectId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const types = {
  Plan: {
    currency: true
  }
}

const generateQuery = (type, data) => {
  const args = Object.keys(data)
    .map(key => [
      key,
      types[type][key] ? x[key] : JSON.stringify(data[key])
    ].join(': '))
    .join(', ')
  return `{
    create${type}(
      ${args}
    ) {
      id
    }
  }`
}

const transformPayload = (type, payload) => {
  const value = key => types[type] && types[type][key]
    ? payload[key]
    : typeof payload[key] === 'object' && payload[key]
      ? JSON.stringify(JSON.stringify(payload[key]))
      : JSON.stringify(payload[key])
  return Object.keys(payload)
    .map(key => `${key}: ${value(key)}`)
    .join(', ')
}

const data = type => require(`./all${type}s.json`).data[`all${type}s`]

Promise.all([
  'Plan',
  'Service'
]
  .map(type => Promise.all(data(type)
    .map(x => client.request(`mutation {
      create${type}(
        ${transformPayload(type, x)}
      ) {
        id
      }
    }`)))
  )
)
  .then(res => console.log(`${res.reduce((acc, x) => x.length + acc, 0)} data added`))