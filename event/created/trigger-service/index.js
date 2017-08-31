const axios = require('axios')

const query = `mutation(
  $body: String,
  $code: String!,
  $duration: Int,
  $eventId: ID!,
  $triggerId:ID!
) {
  createTaskLog(
  	body: $body,
    code: $code,
    duration: $duration,
    eventId: $eventId,
    triggerId: $triggerId
  ) {
    id
  }
}`

const startMonitoring = () => {
  const durationStart = new Date().getTime()
  return data => Object.assign({},
    data,
    { duration: new Date().getTime() - durationStart }
  )
}

const logResponse = (secrets, event) => response => {
  const variables = {
    triggerId: event.trigger.id,
    body: response.data ? JSON.stringify(response.data) : response.message,
    code: (response.status || response.code || 'ERROR').toString(),
    eventId: event.id,
    duration: response.duration || 0
  }
  return axios({
    method: 'POST',
    url: `https://api.graph.cool/simple/v1/${secrets.PROJECT_ID}`,
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${secrets.SECRET}`
    },
    data: {
      query,
      variables
    }
  })
    .then(x => x.data)
}

module.exports = (context, callback) => {
  const eventData = context.body.data.Event.node
  const monitoring = startMonitoring()
  const log = logResponse(context.secrets, eventData)
  return axios({
    method: 'POST',
    url: eventData.trigger.service.endpoint,
    data: {
      meta: eventData.trigger.serviceData,
      payload: eventData.payload
    }
  })
    .then(monitoring)
    .then(log)
    .catch(log)
    .then(x => callback(null, x))
}
