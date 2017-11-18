import { GraphQLClient } from "graphql-request";

interface IEthereumTransactionConnector {
  id: string;
}

const query = `query {
  allEthereumTransactionConnectors { id }
}`;

const mutation = `mutation (id: $ID!, matchType: ETHEREUM_TRANSACTION_MATCH_TYPE) {
  updateEthereumTransactionConnector(id: $id, matchType: $matchType) { id }
}`;

export default async (client: GraphQLClient) => {
  const { allEthereumTransactionConnectors } = await client
    .request<{ allEthereumTransactionConnectors: [IEthereumTransactionConnector] }>(query);
  for (const node of allEthereumTransactionConnectors) {
    await client.request(mutation, { id: node.id, matchType: "ANY" });
  }
};
