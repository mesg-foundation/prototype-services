const fetch = require('isomorphic-fetch')

module.exports = headers => url => query => fetch(url, {
  headers,
  method: 'POST',
  body: JSON.stringify({ query })
})
  .then(x => x.json())
