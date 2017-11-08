const vm = require('vm')

export default event => vm
  .runInContext(event.meta.code, vm.createContext({
    module,
    console,
    require
  }))(event)
