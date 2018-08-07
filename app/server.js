const Readline = require('@serialport/parser-readline')

const { StringDecoder } = require('string_decoder')
const decoder = new StringDecoder('utf8')

const prompt = 'dwm> '

const removePrompt = line => line.replace(prompt, '')

const parseCoordinates = csv => {
  const [cmd, , sensor_id, x, y, z, accuracy, hex] = csv.split(',')

  switch (cmd) {
    case 'POS':
      return {
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

const defaultOpts = {
  shellCommandReceived() {},
  lecCommandReceived() {},
  ready() {},
}

module.exports = (SerialPort, dbClient, opts) => {
  const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200,
  })

  const quit = () => {
    port.write('quit\r', () => {
      port.close(() => process.exit(1))
    })
  }

  process.once('SIGINT', () => {
    console.info('SIGINT received...')
    quit()
  })
  process.once('SIGTERM', () => {
    console.info('SIGTERM received...')
    quit()
  })

  opts = { ...defaultOpts, ...opts }

  let state = 'OPENING'

  port.on('open', () => {
    state = 'OPEN'
    console.info('Sending shell command...')
    port.write('\r\r', opts.shellCommandReceived)
  })

  port.on('data', data => {
    const message = decoder.write(data)
    switch (state) {
      case 'OPEN':
        if (message.endsWith(prompt)) {
          state = 'SHELL'
          console.info('Sending lec command...')
          port.write('lec\r', opts.lecCommandReceived)
        }
        break
      case 'SHELL':
        if (message.endsWith(prompt)) {
          state = 'POS'
          opts.ready()
        }
        break
    }
  })

  port.on('error', err => {
    console.error('Error on port', err)
  })

  port.on('close', () => {
    console.info('Port closed')
  })

  const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

  parser.on('data', line => {
    const message = removePrompt(line)
    if (message && message !== 'lec') {
      const coordinates = parseCoordinates(message)

      dbClient.saveCoordinates(coordinates)
    }
  })

  return port
}
