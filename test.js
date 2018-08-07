const test = require('ava')
const SerialPort = require('serialport/test')
const MockBinding = SerialPort.Binding

test.cb('Can read serial port and send to server', t => {
  t.plan(5)

  const mockDbClient = {
    saveCoordinates({ sensor_id, x, y, z }) {
      t.is(x, 10)
      t.is(y, 20)
      t.is(z, 30)
      t.is(sensor_id, 'ABC123')
      t.end()
    },
  }

  MockBinding.createPort('/dev/ttyACM0', { echo: true, record: true })

  const createPort = require('./app/server')
  const port = createPort(SerialPort, mockDbClient, () => {
    t.is(port.binding.lastWrite.toString('utf8'), '\r\r')

    port.binding.emitData(Buffer.from('ABC123\t10\t20\t30\n'))
  })
})
