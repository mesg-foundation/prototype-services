import { paramCase } from "change-case";
import fs from "fs";
import { GraphQLClient } from "graphql-request";
import yaml from "js-yaml";
import os from "os";
import vm from "vm";

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

const migrateFile = async (filename, client) => {
  const migration = require(`${MIGRATION_PATH}/${filename}`);
  await migration(client);
  const { createMigration } = await client.request(`mutation {
    createMigration(migrationName: "${migrationName(filename)}") {
      id
      migrationName
    }
  }`);
  return createMigration;
};

const migrateFiles = async (files, client) => {
  for (const file of files) {
    const migrated = await checkMigration(file, client);
    if (!migrated) {
      const res = await migrateFile(file, client);
      console.log(`Migrations ${res.migrationName} applied`);
    }
  }
};

const migrate = () => {
  const { targets } = yaml.safeLoad(fs.readFileSync("./.graphcoolrc", "utf8"));
  const defaultConf = yaml.safeLoad(fs.readFileSync(`${os.homedir()}/.graphcoolrc`, "utf8"));
  const target = targets[process.argv[3] || "dev"];
  const api = `${endpoint(target, defaultConf)}/simple/v1/${projectId(target)}`;
  const client = new GraphQLClient(api, {
    headers: {
      Authorization: `Bearer ${authorization(target, defaultConf)}`,
    },
  });
  console.log(`Migration in progress for ${api}`);

  fs.readdir(MIGRATION_PATH, (err, files) => err
    ? console.error(err)
    : migrateFiles(files, client),
  );
};

const create = () => {
  const name = process.argv[3];
  if (!name) { throw new Error("You should give a name to your migration"); }
  const time = (new Date()).toISOString();
  const filename = [time, paramCase(name)].join("_");
  const content = `module.exports = async client => {}`;
  const path = `${MIGRATION_PATH}/${filename}.js`;
  fs.writeFile(path, content, (err) => err
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
