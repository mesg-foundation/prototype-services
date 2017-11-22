const connector = (trigger) => [
  "ethereumContract",
  "ethereumTransaction",
  "ethereumToken",
]
  .map((x) => trigger.connector[x])
  .filter((x) => x)[0];

export default (event) => ({
  connector: connector(event.trigger),
  meta: event.trigger.action.data,
  payload: event.payload,
  project: {
    id: event.trigger.project.id,
  },
  transaction: {
    block: event.blockId,
    fees: event.fees,
    from: event.from,
    id: event.transactionId,
    timestamp: +new Date(event.executedAt || event.createdAt),
    to: event.to,
    value: event.value,
  },
  trigger: {
    id: event.trigger.id,
  },
  url: `${process.env.DASHBOARD_URL}/triggers/${event.trigger.id}`,
});
