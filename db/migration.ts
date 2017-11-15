import { paramCase } from "change-case";
import { readdir, readFileSync, writeFile } from "fs";
import { GraphQLClient } from "graphql-request";
import { safeLoad } from "js-yaml";
import { homedir } from "os";

const cmd = process.argv[2];
const MIGRATION_PATH = `./db/migrations`;

const isLocalTarget = (target) => target.startsWith("local/");
const endpoint = (target, defaultConf) => isLocalTarget(target)
  ? defaultConf.clusters.local.host
  : "https://api.graph.cool";
const projectId = (target) => target.split("/")[1];
const authorization = (target, defaultConf) => isLocalTarget(target)
  ? defaultConf.clusters.local.clusterSecret
  : defaultConf.platformToken;

const migrationName = (file) => file.replace(/.[jt]s$/, "");

const checkMigration = async (file, client) => {
  const { allMigrations } = await client.request(`{
    allMigrations(first: 1, filter: { migrationName: "${migrationName(file)}" }) {
      id
    }
  }`);
  return allMigrations.length > 0;
};

const migrateFile = async (filename, client, defaultEventMeta) => {
  const migration = require(`./migrations/${filename}`).default;
  await migration(client, defaultEventMeta);
  const { createMigration } = await client.request(`mutation {
    createMigration(migrationName: "${migrationName(filename)}") {
      id
      migrationName
    }
  }`);
  return createMigration;
};

const migrateFiles = async (files, client, defaultEventMeta) => {
  for (const file of files) {
    const migrated = await checkMigration(file, client);
    if (!migrated) {
      const res = await migrateFile(file, client, defaultEventMeta);
      console.log(`Migrations ${res.migrationName} applied`);
    }
  }
};

const migrate = () => {
  const { targets } = safeLoad(readFileSync("./.graphcoolrc", "utf8"));
  const defaultConf = safeLoad(readFileSync(`${homedir()}/.graphcoolrc`, "utf8"));
  const target = targets[process.argv[3] || "local"];
  const api = `${endpoint(target, defaultConf)}/simple/v1/${projectId(target)}`;
  const client = new GraphQLClient(api, {
    headers: {
      Authorization: `Bearer ${authorization(target, defaultConf)}`,
    },
  });
  const defaultEventMeta = {
    context: {
      graphcool: {
        endpoints: {
          relay: `${endpoint(target, defaultConf)}/relay/v1/${projectId(target)}`,
          simple: `${endpoint(target, defaultConf)}/simple/v1/${projectId(target)}`,
          subscriptions: `wss://subscriptions.graph.cool/v1/${projectId(target)}`,
          system: `${endpoint(target, defaultConf)}/system"}`,
        },
        rootToken: authorization(target, defaultConf),
        serviceId: projectId(target),
      },
    },
  };

  console.log(`Migration in progress for ${api}`);

  readdir(MIGRATION_PATH, (err, files) => err
    ? console.error(err)
    : migrateFiles(files, client, defaultEventMeta),
  );
};

const create = () => {
  const name = process.argv[3];
  if (!name) { throw new Error("You should give a name to your migration"); }
  const time = (new Date()).toISOString();
  const filename = [time, paramCase(name)].join("_");
  const content = `import { GraphQLClient } from "graphql-request";
export default async (client) => {

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
