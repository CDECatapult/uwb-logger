const pino = require('pino')
const { LOG_LEVEL } = require('./env')

module.exports = pino(
  {
    name: 'UWB_LOGGER',
    level: LOG_LEVEL,
  },
  process.stdout
)
