import axios from "axios";
import { fromEvent } from "graphcool-lib";
import * as Services from "./services";

const query = `mutation(
  $result: String,
  $error: Boolean,
  $duration: Int,
  $eventId: ID!,
  $triggerId: ID!,
  $lastLogAt: DateTime
) {
  createTaskLog(
    result: $result,
    error: $error,
    duration: $duration,
    eventId: $eventId,
    triggerId: $triggerId
  ) {
    id
  }
  updateEvent(id: $eventId, lastLogAt: $lastLogAt) {
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

const logResponse = (event, api) => ({ result, error, duration = 0 }) => api.request(query, {
  duration,
  error: !!error,
  eventId: event.id,
  lastLogAt: new Date(),
  result: error ? (error.message || JSON.stringify(error)) : JSON.stringify(result),
  triggerId: event.trigger.id,
});

const connector = (trigger) => [
  "ethereumContract",
  "ethereumTransaction",
  "ethereumToken",
]
  .map((x) => trigger.connector[x])
  .filter((x) => x)[0];

const params = (eventData) => ({
  connector: connector(eventData.trigger),
  meta: eventData.trigger.action.data,
  payload: eventData.payload,
  project: {
    id: eventData.trigger.project.id,
  },
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
  url: `${process.env.DASHBOARD_URL}/triggers/${eventData.trigger.id}`,
});

export default async (event) => {
  const eventData = event.data.Event.node;
  const monitoring = startMonitoring();
  const api = fromEvent(event).api("simple/v1");
  const log = logResponse(eventData, api);
  try {
    const service = Services[eventData.trigger.action.service.key];
    const result = await service({
      ...params(eventData),
      context: eventData.trigger.action.service.isSystem ? event.context : null,
    });
    return log(monitoring({ result }));
  } catch (error) {
    return log(monitoring({ error }));
  }
};
