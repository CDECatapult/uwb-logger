const test = require('ava')
const SerialPort = require('serialport/test')
const MockBinding = SerialPort.Binding
const createPortListener = require('./app/server')

test('Can read serial port and send to server', t => {
  // Create a port and enable the echo and recording.
  MockBinding.createPort('/dev/ttyACM0', { echo: true, record: true })
  const port = createPortListener()
})
