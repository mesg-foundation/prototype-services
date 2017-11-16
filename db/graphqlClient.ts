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
};
