module.exports = () => `query {
  allPlans(
    first: 1, 
    filter: {
      price: 0
    }
  ) {
    id
  }
}`