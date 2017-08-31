module.exports = email => `query {
  User(email: "${email}") {
    id
  }
}`