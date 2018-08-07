const Readline = require('@serialport/parser-readline')
const Ready = require('@serialport/parser-ready')

const { StringDecoder } = require('string_decoder')
const decoder = new StringDecoder('utf8')

const parseCoordinates = csv => {
  const [cmd, arg, sensor_id, x, y, z, accuracy, hex] = csv.split(',')

  switch (cmd) {
    case 'POS':
      return {
        arg,
        sensor_id,
        x: Number(x),
        y: Number(y),
        z: Number(z),
        accuracy: Number(accuracy),
        hex,
      }
    default:
      throw new Error(`Unknown command ${cmd}`)
  }
}

function noop() {}

module.exports = (SerialPort, dbClient, portDidOpen = noop) => {
  const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200,
  })

  let state = 'OPENING'

  port.on('open', () => {
    console.log('open')
    state = 'OPEN'
    port.write('\r\r', portDidOpen)
  })

  port.on('data', data => {
    const message = decoder.write(data)
    switch (state) {
      case 'OPEN':
        if (message === '\r\ndwm> ') {
          state = 'SHELL'
          port.write('lec\r', () => {
            state = 'POS'
            console.log('lec done')
          })
        }
        break
      case 'POS':
        console.log(`pos: ${message}`)
        break
      default:
        console.log(`state = ${state}, message = "${message}"`)
    }
  })

  const parser = port
    //.pipe(new Ready({ delimiter: 'READY' }))
    .pipe(new Readline({ delimiter: '\r\n' }))

  parser.on('data', data => {
    console.log(`data: "data"`)
    //const coordinates = parseCoordinates(data)

    //dbClient.saveCoordinates(coordinates)
  })

  return port
}
