import axios from "axios";
import * as FormData from "form-data";
import { readFileSync } from "fs";
import { GraphQLClient } from "graphql-request";
import { safeLoad } from "js-yaml";
import { homedir } from "os";

const defaultConf = safeLoad(readFileSync(`${homedir()}/.graphcoolrc`, "utf8"));
const isLocalTarget = (target) => target.startsWith("local/");
const endpoint = (target) => isLocalTarget(target)
  ? defaultConf.clusters.local.host
  : "https://api.graph.cool";
const projectId = (target) => target.split("/")[1];
const authorization = (target) => isLocalTarget(target)
  ? defaultConf.clusters.local.clusterSecret
  : defaultConf.platformToken;
const getTarget = (targetName) => safeLoad(readFileSync("./.graphcoolrc", "utf8")).targets[targetName || "local"];

const fileClient = (targetName) => ({
  send: async (filePath) => {
    const target = getTarget(targetName);
    const api = `${endpoint(target)}/file/v1/${projectId(target)}`;
    if (targetName === "local") {
      const fullPath = filePath.startsWith("/") ? filePath : [process.cwd(), filePath.replace(/^\.\//, "")].join("/");
      return `file://${fullPath}`;
    }
    const data = new FormData();
    data.append("data", readFileSync(filePath));
    const response = await axios.post(api, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response.data);
    return response.data;
  },
});

const client = (targetName) => {
  const target = getTarget(targetName);
  const api = `${endpoint(target)}/simple/v1/${projectId(target)}`;
  return new GraphQLClient(api, {
    headers: {
      Authorization: `Bearer ${authorization(target)}`,
    },
  });
};

const defaultEvent = (targetName) => {
  const target = getTarget(targetName);
  return {
    context: {
      graphcool: {
        endpoints: {
          relay: `${endpoint(target)}/relay/v1/${projectId(target)}`,
          simple: `${endpoint(target)}/simple/v1/${projectId(target)}`,
          subscriptions: `wss://subscriptions.graph.cool/v1/${projectId(target)}`,
          system: `${endpoint(target)}/system"}`,
        },
        rootToken: authorization(target),
        serviceId: projectId(target),
      },
    },
  };
};

export default {
  client,
  defaultEvent,
  fileClient,
};
