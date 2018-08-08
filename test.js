const test = require('ava')
const SerialPort = require('serialport/test')
const createPort = require('./app/server')
const MockBinding = SerialPort.Binding

test.cb('enter shell mode and send lec command', t => {
  t.plan(3)

  const mockDbClient = {
    saveCoordinates() {},
  }

  const opts = {
    shellCommandReceived() {
      t.is(port.binding.lastWrite.toString('utf8'), '\r\r')
      port.binding.emitData(Buffer.from('\r\ndwm> '))
    },
    lecCommandReceived() {
      t.is(port.binding.lastWrite.toString('utf8'), 'lec\r')
      port.binding.emitData(Buffer.from('lec\r\ndwm> '))
    },
    ready() {
      t.pass()
      t.end()
    },
  }

  MockBinding.createPort('/dev/ttyACM0', {
    echo: false,
    record: true,
    readyData: '',
  })

  const handleError = err => t.fail(err)
  const port = createPort(SerialPort, mockDbClient, handleError, opts)
})

test.cb('read coordinates from serial port', t => {
  t.plan(1)

  const mockDbClient = {
    saveCoordinates(pos) {
      t.deepEqual(pos, {
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

  MockBinding.createPort('/dev/ttyACM0', {
    echo: false,
    record: true,
    readyData: '',
  })

  const handleError = err => t.fail(err)
  const port = createPort(SerialPort, mockDbClient, handleError)
  port.on('open', () => {
    port.binding.emitData(Buffer.from('POS,0,8B32,1.74,0.38,0.42,100,x16\r\n'))
  })
})

test.cb('Can read multiple messages', t => {
  t.plan(3)

  const expectedCoordinates = [
    {
      sensor_id: '8B32',
      x: 1.77,
      y: 0.55,
      z: 0.32,
      accuracy: 100,
      hex: 'x0C',
    },
    {
      sensor_id: '8B32',
      x: 1.76,
      y: 0.56,
      z: 0.33,
      accuracy: 100,
      hex: 'x0B',
    },
    {
      sensor_id: '8B32',
      x: 1.74,
      y: 0.38,
      z: 0.42,
      accuracy: 100,
      hex: 'x16',
    },
  ]

  const mockDbClient = {
    saveCoordinates(pos) {
      t.deepEqual(pos, expectedCoordinates.pop())
      if (!expectedCoordinates.length) {
        t.end()
      }
    },
  }

  MockBinding.createPort('/dev/ttyACM0', {
    echo: false,
    record: true,
    readyData: '',
  })

  const handleError = err => t.fail(err)
  const port = createPort(SerialPort, mockDbClient, handleError)
  port.on('open', () => {
    port.binding.emitData(
      Buffer.from(
        'dwm> POS,0,8B32,1.74,0.38,0.42,100,x16\r\nPOS,0,8B32,1.76,0.56,0.33,100,x0B\r\nPOS,0,8B32,1.77,0.55,0.32,100,x0C\r\n'
      )
    )
  })
})
