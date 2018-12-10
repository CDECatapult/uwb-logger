const test = require('ava')
const pino = require('pino')
const mock = require('mock-require')
const SerialPort = require('serialport/test')
const createPort = require('./app/server')
const MockBinding = SerialPort.Binding

const logger = pino({ level: 'silent' })

function getPort(t, dbClient, opts) {
  const handleError = err => t.fail(err)
  const port = createPort(SerialPort, dbClient, logger, handleError, opts)
  return port
}

function createKnexMock(handleInsert) {
  mock('knex', function() {
    return {
      insert(data) {
        return {
          into(table) {
            handleInsert(table, data)
            return Promise.resolve()
          },
        }
      },
    }
  })
}

function getDbClient() {
  const createDbClient = mock.reRequire('./app/db')

  return createDbClient({
    username: 'DB_USERNAME',
    password: 'DB_PASSWORD',
    host: 'DB_HOST',
    port: 'DB_PORT',
    name: 'DB_NAME',
  })
}

test.afterEach.always(() => mock.stopAll())

test.cb.serial('enter shell mode and send lec command', t => {
  t.plan(3)

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

  const port = getPort(t, null, opts)
})

test.cb.serial('read coordinates from serial port', t => {
  t.plan(2)

  createKnexMock((table, data) => {
    t.is(table, 'coordinates')
    t.deepEqual(data, {
      sensor_id: '8B32',
      x: 1.74,
      y: 0.38,
      z: 0.42,
      accuracy: 100,
      hex: 'x16',
    })
    t.end()
  })

  const dbClient = getDbClient()

  MockBinding.createPort('/dev/ttyACM0', {
    echo: false,
    record: true,
    readyData: '',
  })

  const port = getPort(t, dbClient)
  port.on('open', () => {
    port.binding.emitData(Buffer.from('POS,0,8B32,1.74,0.38,0.42,100,x16\r\n'))
  })
})

test.cb.serial('Can read multiple messages', t => {
  t.plan(6)

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

  createKnexMock((table, data) => {
    t.is(table, 'coordinates')
    t.deepEqual(data, expectedCoordinates.pop())
    if (!expectedCoordinates.length) {
      t.end()
    }
  })

  const dbClient = getDbClient()

  MockBinding.createPort('/dev/ttyACM0', {
    echo: false,
    record: true,
    readyData: '',
  })

  const port = getPort(t, dbClient)
  port.on('open', () => {
    port.binding.emitData(
      Buffer.from(
        'dwm> POS,0,8B32,1.74,0.38,0.42,100,x16\r\nPOS,0,8B32,1.76,0.56,0.33,100,x0B\r\nPOS,0,8B32,1.77,0.55,0.32,100,x0C\r\n'
      )
    )
  })
})
