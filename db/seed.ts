import { GraphQLClient } from "graphql-request";

const projectId = process.argv[2];
const token = process.argv[3];

if (!projectId || !token) {
  console.log("ERROR: Command should contains the project id and the authentication token");
  console.log();
  console.log("> yarn db:seed __PROJECT_ID__ __AUTH_TOKEN__");
  console.log();
  process.exit(0);
}

const client = new GraphQLClient(`http://localhost:60000/simple/v1/${projectId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const types = {
  Plan: {
    currency: true,
  },
};

const transformPayload = (type, payload) => {
  const value = (key) => types[type] && types[type][key]
    ? payload[key]
    : typeof payload[key] === "object" && payload[key]
      ? JSON.stringify(JSON.stringify(payload[key]))
      : JSON.stringify(payload[key]);
  return Object.keys(payload)
    .map((key) => `${key}: ${value(key)}`)
    .join(", ");
};

const data = (type) => require(`./all${type}s.json`).data[`all${type}s`];

const deleteAll = async (type) => {
  const ids = (await client.request(`query { all${type}s { id } }`))[`all${type}s`];
  return Promise.all(ids.map(({ id }) => client.request(`mutation { delete${type}(id: "${id}") { id } }`)));
};

const addAll = async (type) => {
  return Promise.all(data(type)
    .map((x) => client.request(`mutation {
      create${type}(
        ${transformPayload(type, x)}
      ) {
        id
      }
    }`)));
};

[
  "Plan",
  "Service",
].forEach(async (type) => {
  await deleteAll(type);
  await addAll(type);
});
