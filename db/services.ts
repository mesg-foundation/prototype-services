import { existsSync, readdir, readFileSync, writeFile } from "fs";
import GraphQLClient from "./graphqlClient";

const SERVICES_PATH = "./src/functions/trigger-service/services";
const BLACKLIST = [".git", "index.ts", ".DS_Store"];

const services = async () => new Promise((resolve, reject) => {
  readdir(SERVICES_PATH, (err, files) => err
    ? reject(err)
    : resolve(files),
  );
})
  .then((files: string[]) => files.filter((x) => BLACKLIST.indexOf(x) < 0));

const deployService = async (api, file, service) => {
  const schema = JSON.parse(readFileSync(`${SERVICES_PATH}/${service}/schema.json`, "utf-8"));
  const { Service } = await api.request(`{ Service(key: "${service}") { id } }`);
  const name = schema.title || service;
  const description = schema.description;

  const logoPath = ["svg", "png", "jpg"]
    .filter((ext) => existsSync(`${SERVICES_PATH}/${service}/logo.${ext}`))
    .map((ext) => `${SERVICES_PATH}/${service}/logo.${ext}`)[0];

  const url = await file.send(logoPath);
  if (Service && Service.id) {
    return api.request(`mutation { updateService(
      id: "${Service.id}"
      data: ${JSON.stringify(JSON.stringify(schema))}
      name: "${name}"
      description: "${description}"
      picture: "${url}"
    ) { id } }`);
  } else {
    return api.request(`mutation { createService(
      key: "${service}"
      data: ${JSON.stringify(JSON.stringify(schema))}
      name: "${name}"
      description: "${description}"
      picture: "${url}"
    ) { id } }`);
  }
};

const migrate = async (target) => {
  const api = GraphQLClient.client(target);
  const file = GraphQLClient.fileClient(target);
  for (const service of (await services())) {
    await deployService(api, file, service);
  }
};

migrate(process.argv[2]);
