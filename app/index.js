const SerialPort = require('serialport')
const Raven = require('raven')
const env = require('./env')
const createDbClient = require('./db')
const createPort = require('./server.js')

if (env.RAVEN_DSN) {
  Raven.config(env.SENTRY_DSN).install()
}

const dbClient = createDbClient({
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  name: env.DB_NAME,
})

const opts = {
  shellCommandReceived() {
    console.info('Shell command sent')
  },
  lecCommandReceived() {
    console.info('Lec command sent')
  },
  ready() {
    console.info('Ready to receive POS')
  },
}

createPort(SerialPort, dbClient, opts).catch(err => {
  if (env.RAVEN_DSN) {
    Raven.captureException(err)
  }
})
