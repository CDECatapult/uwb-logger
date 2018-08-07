const test = require('ava')
const SerialPort = require('serialport/test')
const MockBinding = SerialPort.Binding

test.cb('Can read serial port and send to server', t => {
  t.plan(2)

  const mockDbClient = {
    saveCoordinates(pos) {
      t.deepEqual(pos, {
        arg: '0',
        sensor_id: '8B32',
        x: 1.74,
        y: 0.38,
        z: 0.42,
        accuracy: 100,
        hex: 'x16',
      })
      t.end()
    },
  }

  MockBinding.createPort('/dev/ttyACM0', { echo: true, record: true })

  const createPort = require('./app/server')
  const port = createPort(SerialPort, mockDbClient, () => {
    t.is(port.binding.lastWrite.toString('utf8'), '\r\r')

    port.binding.emitData(Buffer.from('POS,0,8B32,1.74,0.38,0.42,100,x16\n'))
  })
})
