const fs = require('fs')
const os = require('os')
const vm = require('vm')
const yaml = require('js-yaml')
const { paramCase } = require('change-case')
const { GraphQLClient } = require('graphql-request')
const cmd = process.argv[2]
const MIGRATION_PATH = `./db/migrations`

const isLocalTarget = target => target.startsWith('local/')
const endpoint = (target, defaultConf) => isLocalTarget(target) ? defaultConf.clusters.local.host : 'https://api.graph.cool'
const projectId = target => target.split('/')[1]
const authorization = (target, defaultConf) => isLocalTarget(target)
  ? defaultConf.clusters.local.clusterSecret
  : defaultConf.platformToken

const migrationName = file => file.replace(/.[jt]s$/, '')

const checkMigration = async (file, client) => {
  const { allMigrations } = await client.request(`{
    allMigrations(first: 1, filter: { migrationName: "${migrationName(file)}" }) {
      id
    }
  }`)
  return allMigrations.length > 0
}

const migrateFile = async (filename, client) => {
  const code = fs.readFileSync(`${MIGRATION_PATH}/${filename}`, 'utf8')
  const sandboxedFunc = vm.runInContext(code, vm.createContext({
    console,
    require,
    module
  }))
  await sandboxedFunc(client)
  const { createMigration } = await client.request(`mutation {
    createMigration(migrationName: "${migrationName(filename)}") {
      id
      migrationName
    }
  }`)
  return createMigration
}

const migrateFiles = async (files, client) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const migrated = await checkMigration(file, client)
    if (!migrated) {
      const { migrationName } = await migrateFile(file, client)
      console.log(`Migrations ${migrationName} applied`)
    }
  }
}

const migrate = () => {
  const { targets } = yaml.safeLoad(fs.readFileSync('./.graphcoolrc', 'utf8'))
  const defaultConf = yaml.safeLoad(fs.readFileSync(`${os.homedir()}/.graphcoolrc`, 'utf8'))
  const target = targets[process.argv[3] || 'dev']
  const api = `${endpoint(target, defaultConf)}/simple/v1/${projectId(target)}`
  const client = new GraphQLClient(api, { headers: { 'Authorization': `Bearer ${authorization(target, defaultConf)}` } })
  console.log(`Migration in progress for ${api}`)

  fs.readdir(MIGRATION_PATH, (err, files) => err
    ? console.error(err)
    : migrateFiles(files, client)
  )
}

const create = () => {
  const name = process.argv[3]
  if (!name) throw new Error('You should give a name to your migration')
  const time = (new Date()).toISOString()
  const filename = [time, paramCase(name)].join('_')
  const content = `module.exports.migrate = api => {}`
  const path = `${MIGRATION_PATH}/${filename}.js`
  fs.writeFile(path, content, err => err
    ? console.error(err)
    : console.log(`migration file written at ${path}`)
  )
}

;({
  create,
  migrate
}[cmd] || migrate)()
