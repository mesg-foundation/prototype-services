module.exports = userId => customer => `mutation {
  updateUser(
    id: "${userId}",
    stripeId: "${customer.id}"
  ) {
	  id
  }
}`