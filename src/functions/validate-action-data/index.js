const fromEvent = require('graphcool-lib').fromEvent
const validate = require('jsonschema').validate

module.exports = event => {
  const { serviceId, data } = event.data

  const api = fromEvent(event).api('simple/v1')
  return api.request(`query {
    Service(id: "${serviceId}") { data }
  }`)
    .then(x => validate(data, x.Service.data))
    .then(result => {
      if (result.valid) { return { data: event.data } }
      return { error: result.errors[0].message }
    })
}