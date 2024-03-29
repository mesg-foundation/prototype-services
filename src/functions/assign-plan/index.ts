import { fromEvent } from "graphcool-lib";

interface IPlan {
  id: string;
}

const freePlanQuery = () => `query {
  allPlans(
    first: 1,
    filter: {
      price: 0
    }
  ) {
    id
  }
}`;

const assignPlanQuery = (projectId, planId) => `mutation {
  addToProjectOnPlan(
    planPlanId: "${planId}",
    projectsProjectId: "${projectId}"
  ) {
    planPlan {
      id
    }
  }
}`;

export default (event) => {
  const project = event.data.Project.node;

  if (project.plan && project.plan.id) {
    return Promise.resolve({ error: "This project already have a plan" });
  }

  const api = fromEvent(event).api("simple/v1");
  return api.request<{ allPlans: IPlan[] }>(freePlanQuery())
    .then((x) => x.allPlans[0].id)
    .then((x) => api.request(assignPlanQuery(project.id, x)));
};
