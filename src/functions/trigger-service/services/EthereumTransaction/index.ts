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

const getTransactionReceipt = async (eth, txHash) => new Promise((resolve) => {
  const interval = setInterval(() => {
    eth.getTransactionReceipt(txHash, (err, receipt) => {
      if (receipt) {
        clearInterval(interval);
        resolve(receipt);
      }
    });
  }, 300);
});

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
  let gas = null;
  try {
    gas = (await eth.estimateGas(txData)).toString();
  } catch (e) {
    throw new Error("Cannot calculate extimate gas. Please verify your data");
  }
  try {
    const transaction = await eth.sendRawTransaction(sign({
      ...txData,
      gas,
    }, account.privateKey));
    const receipt = await getTransactionReceipt(eth, transaction);
    return receipt;
  } catch (e) {
    if (e.value) {
      throw new Error(e.value.message);
    } else {
      throw e;
    }
  }
};
