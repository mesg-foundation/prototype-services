import { paramCase } from "change-case";
import { readdir, writeFile } from "fs";
import GraphQLClient from "./graphqlClient";

const cmd = process.argv[2];
const MIGRATION_PATH = `./db/migrations`;

const migrationName = (file) => file.replace(/.[jt]s$/, "");

const checkMigration = async (file, api) => {
  const { allMigrations } = await api.request(`{
    allMigrations(first: 1, filter: { migrationName: "${migrationName(file)}" }) {
      id
    }
  }`);
  return allMigrations.length > 0;
};

const migrateFile = async (filename, api, defaultEventMeta) => {
  const migration = require(`./migrations/${filename}`).default;
  await migration(api, defaultEventMeta);
  const { createMigration } = await api.request(`mutation {
    createMigration(migrationName: "${migrationName(filename)}") {
      id
      migrationName
    }
  }`);
  return createMigration;
};

const migrateFiles = async (files, api, defaultEventMeta) => {
  for (const file of files) {
    const migrated = await checkMigration(file, api);
    if (!migrated) {
      const res = await migrateFile(file, api, defaultEventMeta);
      console.log(`Migrations ${res.migrationName} applied`);
    }
  }
};

const migrate = () => {
  const api = GraphQLClient.client(process.argv[3]);
  const defaultEvent = GraphQLClient.defaultEvent(process.argv[3]);

  console.log(`Migration in progress`);

  readdir(MIGRATION_PATH, (err, files) => err
    ? console.error(err)
    : migrateFiles(files, api, defaultEvent),
  );
};

const create = () => {
  const name = process.argv[3];
  if (!name) { throw new Error("You should give a name to your migration"); }
  const time = (new Date()).toISOString();
  const filename = [time, paramCase(name)].join("_");
  const content = `import { GraphQLClient } from "graphql-request";
export default async (client: GraphQLClient) => {

};
`;
  const path = `${MIGRATION_PATH}/${filename}.ts`;
  writeFile(path, content, (err) => err
    ? console.error(err)
    : console.log(`migration file written at ${path}`),
  );
};

const commands = {
  create,
  migrate,
};

if (commands[cmd]) {
  commands[cmd]();
} else {
  migrate();
}
