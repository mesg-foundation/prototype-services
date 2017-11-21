import * as abi from "ethjs-abi";
import { fromEvent } from "graphcool-lib";
import EthereumTransaction from "../EthereumTransaction";

const generateData = ({ meta }) => {
  const payload = typeof meta.payload === "string"
  ? JSON.parse(meta.payload)
  : meta.payload;
  const data = meta.abi.inputs
    .map((input) => payload[input.name]);
  return abi.encodeMethod(meta.abi, data);
};

const getContract = async (api, { meta }) => (await api.request(`{
  Contract(id: "${meta.contractId}") {
    address,
    chain,
    abi
  }
}`)).Contract;

export default async (event) => {
  const api = fromEvent(event).api("simple/v1");
  const contract = await getContract(api, event);
  const data = generateData(event);
  const meta = {
    ...event.meta,
    address: contract.address,
    amount: event.meta.amount,
    chain: contract.chain,
    data,
  };
  return EthereumTransaction({ ...event, meta });
};
