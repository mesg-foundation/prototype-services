import * as HttpProvider from "ethjs-provider-http";
import * as Eth from "ethjs-query";
import { sign } from "ethjs-signer";
import { toWei } from "ethjs-unit";
import { fromEvent } from "graphcool-lib";

interface IAddress {
  address: string;
  privateKey: string;
}

const providers = {
  MAINNET: "https://mainnet.infura.io/",
  TESTNET: "https://kovan.infura.io/",
};

const getAddress = async (api, project, chain) => {
  const { allAddresses } = await api.request(`query {
    allAddresses(first: 1, filter: {
      chain: ${chain},
      project: {
        id: "${project.id}"
      }
    }) {
      address
      privateKey
    }
  }`);
  return allAddresses[0];
};

export default async (event) => {
  const { chain, address, amount, data } = event.meta;
  const api = fromEvent(event).api("simple/v1");
  const account = await getAddress(api, event.project, chain);
  if (!account) {
    throw new Error(`Cannot find address for the project ${event.project.id} for the blockchain ${chain}`);
  }

  const eth = new Eth(new HttpProvider(providers[chain]));
  const txData = {
    data,
    from: account.address,
    gasPrice: (await eth.gasPrice()).toString(),
    nonce: await eth.getTransactionCount(account.address),
    to: address,
    value: toWei(amount, "ether"),
  };
  const gas = (await eth.estimateGas(txData)).toString();
  try {
    const transaction = await eth.sendRawTransaction(sign({
      ...txData,
      gas,
    }, account.privateKey));
    return transaction;
  } catch (e) {
    if (e.value) {
      throw new Error(e.value.message);
    } else {
      throw e;
    }
  }
};
