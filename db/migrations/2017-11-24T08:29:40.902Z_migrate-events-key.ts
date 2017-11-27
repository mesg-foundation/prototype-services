import { GraphQLClient } from "graphql-request";

const totalEventToMigrate = `query {
  _allEventsMeta(filter: { key: null }) {
    count
  }
}`;
const allEventsQuery = `query {
  allEvents(first: 100, filter: { key: null }) {
    id,
    createdAt
  }
}`;
const updateEventQuery = `mutation($id: ID!, $key: String) {
  updateEvent(id: $id, key: $key) {
    id
  }
}`;

const migrate = async (client) => {
  try {
    const { allEvents } = await client.request(allEventsQuery);
    console.log(allEvents.length);
    await Promise.all(allEvents.map((event) => client.request(updateEventQuery, {
      id: event.id,
      key: event.id,
    })));
  } catch (e) {
    migrate(client);
  }
};

const canMigrate = async (client) => (await client.request(totalEventToMigrate))._allEventsMeta.count > 0;

export default async (client: GraphQLClient) => {
  let needMigration = await canMigrate(client);
  while (needMigration) {
    await migrate(client);
    needMigration = await canMigrate(client);
  }
};
