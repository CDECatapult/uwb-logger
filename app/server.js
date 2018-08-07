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
      console.warn(`Malformed input: ${csv}`)
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
    console.log('Sending shell command...')
    port.write('\r\r', () => console.log('Shell command sent'))
  })

  port.on('data', data => {
    const message = decoder.write(data)
    switch (state) {
      case 'OPEN':
        if (message === prompt) {
          state = 'SHELL'
          console.log('Sending lec command...')
          port.write('lec\r', () => console.log('Lec command sent'))
        } else {
          console.log(`state = ${state}, message = "${message}"`)
        }
        break
      case 'SHELL':
        if (message === prompt) {
          state = 'POS'
          console.log('Ready to receive POS')
        } else {
          console.log(`state = ${state}, message = "${message}"`)
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
      console.log(message, coordinates)
    }
  })

  return port
}
