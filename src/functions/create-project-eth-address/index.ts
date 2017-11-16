import { generate } from "ethjs-account";
import { fromEvent } from "graphcool-lib";

interface IAddress {
  id: string;
}

const createAddress = ({ projectId, address, publicKey, privateKey, chain }) => `mutation {
  createAddress(
    projectId: "${projectId}",
    address: "${address}",
    publicKey: "${publicKey}",
    privateKey: "${privateKey}",
    chain: ${chain}
	) {
    id
  }
}`;

const calculateEntropy = () => {
  const length = 32 + Math.ceil((Math.random() * 100));
  return [...new Array(length)]
    .fill("")
    .reduce((prev, res) => [
      prev,
      String.fromCharCode(Math.ceil(Math.random() * 10000)),
    ].join(""));
};

const generateAddress = (blockchain, project) => {
  const { privateKey, publicKey, address } = generate(calculateEntropy());
  return {
    address,
    chain: blockchain,
    privateKey,
    projectId: project.id,
    publicKey,
  };
};

export default (event) => {
  const project = event.data.Project.node;

  const api = fromEvent(event).api("simple/v1");
  return Promise.all([
    api.request<{ createAddress: IAddress }>(createAddress(generateAddress("TESTNET", project))),
    api.request<{ createAddress: IAddress }>(createAddress(generateAddress("MAINNET", project))),
  ]);
};
