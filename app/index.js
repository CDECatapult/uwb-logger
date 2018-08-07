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

createPort(SerialPort, dbClient, opts)
