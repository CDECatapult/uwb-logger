const SerialPort = require('serialport')
const createPort = require('./server.js')
const handler = data => console.log('data', data)

createPort(SerialPort, handler)
