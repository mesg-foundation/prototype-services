const fromEvent = require('graphcool-lib').fromEvent
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

const logResponse = (event, api) => response => {
  const variables = {
    triggerId: event.trigger.id,
    body: response.data ? JSON.stringify(response.data) : response.message,
    code: (response.status || response.code || 'ERROR').toString(),
    eventId: event.id,
    duration: response.duration || 0
  }
  return api.request(query, variables)
}

const connector = trigger => [
  'ethereumContract',
  'ethereumTransaction'
]
  .map(x => trigger.connector[x])
  .filter(x => x)[0]

module.exports = event => {
  const eventData = event.data.Event.node
  const monitoring = startMonitoring()
  const api = fromEvent(event, { token: event.context.graphcool.rootToken }).api('simple/v1')
  const log = logResponse(eventData, api)
  return axios({
    method: 'POST',
    url: eventData.trigger.action.service.endpoint,
    data: {
      url: `${process.env.DASHBOARD_URL}/triggers/${eventData.trigger.id}/${eventData.id}`,
      meta: eventData.trigger.action.data,
      payload: eventData.payload,
      transaction: {
        id: eventData.transactionId,
        block: eventData.blockId,
        from: eventData.from,
        to: eventData.to,
        value: eventData.value,
        fees: eventData.fees
      },
      connector: connector(eventData.trigger),
      trigger: {
        id: eventData.trigger.id,
      }
    }
  })
    .then(monitoring)
    .then(log)
    .catch(log)
}