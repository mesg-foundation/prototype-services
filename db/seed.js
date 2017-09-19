const Lokka = require('lokka').Lokka
const Transport = require('lokka-transport-http').Transport

const client = new Lokka({
  transport: new Transport(`https://api.graph.cool/simple/v1/${process.env.GRAPHCOOL_PROJECT_ID}`, {
    headers: {
      'Authorization': `Bearer ${process.env.GRAPHCOOL_SECRET}`
    }
  })
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
    .map(x => client.mutate(`{
      create${type}(
        ${transformPayload(type, x)}
      ) {
        id
      }
    }`)))
  )
)
  .then(res => console.log(`${res.reduce((acc, x) => x.length + acc, 0)} data added`))