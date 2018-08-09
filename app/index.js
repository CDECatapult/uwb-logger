const SerialPort = require('serialport')
const Raven = require('raven')
const env = require('./env')
const createDbClient = require('./db')
const logger = require('./logger')
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
    logger.info('Shell command sent')
  },
  lecCommandReceived() {
    logger.info('Lec command sent')
  },
  ready() {
    logger.info('Ready to receive POS')
  },
}

const handleError = err => {
  logger.error(err)
  if (env.SENTRY_DSN) {
    logger.info('Sending error to Sentry...')
    Raven.captureException(err, (sendErr, eventId) => {
      if (sendErr) {
        logger.error('Failed to send captured exception to Sentry')
      } else {
        logger.info(`Event Id: ${eventId}`)
      }
    })
  }
}

createPort(SerialPort, dbClient, logger, handleError, opts)
