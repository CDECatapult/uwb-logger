const Readline = require('@serialport/parser-readline')

const { StringDecoder } = require('string_decoder')
const decoder = new StringDecoder('utf8')

const prompt = '\r\ndwm> '

const removePrompt = line => line.replace(/^dwm> (.*)/, '$1')

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
    state = 'OPEN'
    port.write('\r\r', portDidOpen)
  })

  port.on('data', data => {
    const message = decoder.write(data)
    switch (state) {
      case 'OPEN':
        if (message === prompt) {
          state = 'SHELL'
          port.write('lec\r')
        }
        break
      case 'SHELL':
        if (message === prompt) {
          state = 'POS'
        }
        break
    }
  })

  const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

  parser.on('data', line => {
    const message = removePrompt(line)
    if (message && message !== 'lec') {
      const coordinates = parseCoordinates(message)

      //dbClient.saveCoordinates(coordinates)
      console.log(coordinates)
    }
  })

  return port
}
