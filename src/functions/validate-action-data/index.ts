import { fromEvent } from 'graphcool-lib'
import { validate } from 'jsonschema'

interface Service {
  data: JSON
}

export default event => {
  const { serviceId, data } = event.data

  const api = fromEvent(event).api('simple/v1')
  return api.request<{ Service: Service }>(`query {
    Service(id: "${serviceId}") { data }
  }`)
    .then(x => validate(data, x.Service.data))
    .then(result => {
      if (result.valid) { return { data: event.data } }
      return { error: result.errors[0].message }
    })
}
