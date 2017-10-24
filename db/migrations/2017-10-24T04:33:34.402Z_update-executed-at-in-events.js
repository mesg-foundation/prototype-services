const totalEventToMigrate = `query {
  _allEventsMeta(filter: { executedAt: null }) {
    count
  }
}`
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

const migrate = async client => {
  try {
    const { allEvents } = await client.request(allEventsQuery)
    console.log(allEvents.length)
    await Promise.all(allEvents.map(event => client.request(updateEventQuery, {
      id: event.id,
      executedAt: event.createdAt
    })))
  } catch(e) {
    migrate(client)
  }
}

const canMigrate = async client => (await client.request(totalEventToMigrate))._allEventsMeta.count > 0

module.exports = async client => {
  let needMigration = await canMigrate(client)
  while (needMigration) {
    await migrate(client)
    needMigration = await canMigrate(client)
  }
}