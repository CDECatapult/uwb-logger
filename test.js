const test = require('ava')
const SerialPort = require('serialport/test')
const MockBinding = SerialPort.Binding

test.cb('Can read serial port and send to server', t => {
  t.plan(1)

  MockBinding.createPort('/dev/ttyACM0', { echo: true, record: true })
  const handler = data => {
    t.pass()
    t.end()
  }

  const createPort = require('./app/server')
  const port = createPort(SerialPort, handler)

  const message = Buffer.from('ABC\t10\t20\t30\n')
  port.write(message)
})
