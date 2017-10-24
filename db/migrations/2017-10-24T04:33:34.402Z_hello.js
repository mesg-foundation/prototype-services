const allEventsQuery = `query {
  allEvents(filter: { executedAt: null }) {
    id,
    createdAt
  }
}`
const updateEventQuery = `mutation($id: ID!, $executedAt: DateTime!) {
  updateEvent(id: $id, executedAt: $executedAt) {
    id
  }
}`

module.exports = async client => {
  const { allEvents } = await client.request(allEventsQuery)
  await Promise.all(allEvents.map(event => client.request(updateEventQuery, {
    id: event.id,
    executedAt: event.createdAt
  })))
}