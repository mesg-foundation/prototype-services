import axios from "axios";

export default ({ meta, payload, transaction, connector }) => axios({
  data: {
    connector,
    payload,
    transaction,
  },
  headers: !Array.isArray(meta.headers)
    ? meta.headers
    : meta.headers
      .reduce((acc, { key, value }) => ({
        ...acc,
        [key]: value,
      }), {}),
  method: meta.method || "POST",
  url: meta.endpoint,
})
  .then(({ data }) => data);
