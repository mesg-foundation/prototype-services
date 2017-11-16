import { GraphQLClient } from "graphql-request";
import generateAddress from "../../src/functions/create-project-eth-address";

interface IProject {
  id: string;
}

const query = `{
  allProjects { id }
}`;

export default async (client: GraphQLClient, defaultEvent) => {
  const { allProjects } = await client.request<{ allProjects: [IProject] }>(query);
  for (const node of allProjects) {
    await generateAddress({
      ...defaultEvent,
      data: {
        Project: {
          node,
        },
      },
    });
  }
};
