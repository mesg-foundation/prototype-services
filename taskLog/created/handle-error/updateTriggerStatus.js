module.exports = (id, execute) => limitReached => limitReached
  ? execute(`mutation {
    updateTrigger(id: "${id}", enable: false) { id }
  }`)
  : Promise.resolve({})
