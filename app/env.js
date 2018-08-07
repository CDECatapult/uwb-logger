const envalid = require('envalid')

const { host, port, str } = envalid

module.exports = envalid.cleanEnv(process.env, {
  LOG_LEVEL: str({ default: 'info', devDefault: 'debug' }),
  DB_USERNAME: str(),
  DB_PASSWORD: str(),
  DB_NAME: str(),
  DB_HOST: host(),
  DB_PORT: port({ default: 5432 }),
})
