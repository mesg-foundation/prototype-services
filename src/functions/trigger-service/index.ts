import axios from "axios";
import { fromEvent } from "graphcool-lib";

const query = `mutation(
  $body: String,
  $code: String!,
  $duration: Int,
  $eventId: ID!,
  $triggerId:ID!
) {
  createTaskLog(
    body: $body,
    code: $code,
    duration: $duration,
    eventId: $eventId,
    triggerId: $triggerId
  ) {
    id
  }
}`;

const startMonitoring = () => {
  const durationStart = new Date().getTime();
  return (data) => ({
    ...data,
    duration: new Date().getTime() - durationStart,
  });
};

const logResponse = (event, api) => (response) => api.request(query, {
  body: response.data ? JSON.stringify(response.data) : response.message,
  code: (response.status || response.code || "ERROR").toString(),
  duration: response.duration || 0,
  eventId: event.id,
  triggerId: event.trigger.id,
});

const connector = (trigger) => [
  "ethereumContract",
  "ethereumTransaction",
  "ethereumToken",
]
  .map((x) => trigger.connector[x])
  .filter((x) => x)[0];

export default (event) => {
  const eventData = event.data.Event.node;
  const monitoring = startMonitoring();
  const api = fromEvent(event).api("simple/v1");
  const log = logResponse(eventData, api);
  return axios.post(eventData.trigger.action.service.endpoint, {
    connector: connector(eventData.trigger),
    meta: eventData.trigger.action.data,
    payload: eventData.payload,
    transaction: {
      block: eventData.blockId,
      fees: eventData.fees,
      from: eventData.from,
      id: eventData.transactionId,
      timestamp: +new Date(eventData.executedAt || eventData.createdAt),
      to: eventData.to,
      value: eventData.value,
    },
    trigger: {
      id: eventData.trigger.id,
    },
    url: `${process.env.DASHBOARD_URL}/triggers/${eventData.trigger.id}/${eventData.id}`,
  })
    .then(monitoring)
    .then(log)
    .catch(log);
};
