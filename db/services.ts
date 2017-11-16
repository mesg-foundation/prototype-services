import { readdir, readFileSync, writeFile } from "fs";
import GraphQLClient from "./graphqlClient";

const SERVICES_PATH = "./src/functions/trigger-service/services";
const BLACKLIST = [".git", "index.ts"];

const services = async () => new Promise((resolve, reject) => {
  readdir(SERVICES_PATH, (err, files) => err
    ? reject(err)
    : resolve(files),
  );
})
  .then((files: string[]) => files.filter((x) => BLACKLIST.indexOf(x) < 0));

const deployService = async (api, service) => {
  const schema = JSON.parse(readFileSync(`${SERVICES_PATH}/${service}/schema.json`, "utf-8"));
  const { Service } = await api.request(`{ Service(key: "${service}") { id } }`);
  const name = schema.title || service;
  const description = schema.description;
  if (Service && Service.id) {
    return api.request(`mutation { updateService(
      id: "${Service.id}"
      data: ${JSON.stringify(JSON.stringify(schema))}
      name: "${name}"
      description: "${description}"
    ) { id } }`);
  } else {
    return api.request(`mutation { createService(
      key: "${service}"
      data: ${JSON.stringify(JSON.stringify(schema))}
      name: "${name}"
      description: "${description}"
    ) { id } }`);
  }
};

const migrate = async (target) => {
  const api = GraphQLClient.client(target);
  for (const service of (await services())) {
    await deployService(api, service);
  }
};

migrate(process.argv[2]);
