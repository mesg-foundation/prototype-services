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

export default (event, api) => ({ result, error, duration = 0 }) => api.request(query, {
  duration,
  error: !!error,
  eventId: event.id,
  lastLogAt: new Date(),
  result: error ? (error.message || JSON.stringify(error)) : JSON.stringify(result),
  triggerId: event.trigger.id,
});
