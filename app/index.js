const SerialPort = require('serialport')
const env = require('./env')
const createDbClient = require('./db')
const createPort = require('./server.js')

const dbClient = createDbClient({
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: env.DB_PORT,
  name: env.DB_NAME,
})

createPort(SerialPort, dbClient)
