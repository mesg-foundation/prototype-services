import axios from "axios";
import { fromEvent } from "graphcool-lib";
import extractParamsFromEvent from "./extractParamsFromEvent";
import logResponse from "./logResponse";
import metaPreProcessingExec from "./metaPreProcessing";
import * as Services from "./services";

const startMonitoring = () => {
  const durationStart = new Date().getTime();
  return (data) => ({
    ...data,
    duration: new Date().getTime() - durationStart,
  });
};

export default async (event) => {
  const eventData = event.data.Event.node;
  const monitoring = startMonitoring();
  const api = fromEvent(event).api("simple/v1");
  const log = logResponse(eventData, api);
  const { key, isSystem } = eventData.trigger.action.service;
  const { metaPreProcessing } = eventData.trigger.action;
  const data = extractParamsFromEvent(eventData);
  const service = Services[key];
  try {
    const meta = await metaPreProcessingExec(metaPreProcessing, data);
    const result = await service({
      ...data,
      context: isSystem ? event.context : null,
      meta,
    });
    return log(monitoring({ result }));
  } catch (error) {
    return log(monitoring({ error }));
  }
};
