const Readline = require('@serialport/parser-readline')

const { StringDecoder } = require('string_decoder')
const decoder = new StringDecoder('utf8')

const prompt = 'dwm> '

const removePrompt = line => line.replace(prompt, '')

const defaultOpts = {
  shellCommandReceived() {},
  lecCommandReceived() {},
  ready() {},
}

module.exports = (SerialPort, dbClient, logger, handleError, opts) => {
  const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200,
  })

  const quit = () => {
    port.write('quit\r', () => {
      port.close(() => process.exit(1))
    })
  }

  process.once('SIGINT', () => {
    logger.info('SIGINT received...')
    quit()
  })
  process.once('SIGTERM', () => {
    logger.info('SIGTERM received...')
    quit()
  })

  opts = { ...defaultOpts, ...opts }

  let state = 'OPENING'

  port.on('open', () => {
    state = 'OPEN'
    logger.info('Sending shell command...')
    port.write('\r\r', opts.shellCommandReceived)
  })

  port.on('data', data => {
    const message = decoder.write(data)
    switch (state) {
      case 'OPEN':
        if (message.endsWith(prompt)) {
          state = 'SHELL'
          logger.info('Sending lec command...')
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

  port.on('error', handleError)

  port.on('close', () => {
    logger.info('Port closed')
  })

  const parser = port.pipe(new Readline({ delimiter: '\r\n' }))

  parser.on('data', data => {
    const csv = removePrompt(data)
    if (csv && csv !== 'lec') {
      const [cmd, , sensor_id, x, y, z, accuracy, hex] = csv.split(',')
      if (cmd === 'POS') {
        dbClient
          .saveCoordinates({
            sensor_id,
            x: Number(x),
            y: Number(y),
            z: Number(z),
            accuracy: Number(accuracy),
            hex,
          })
          .catch(handleError)
      } else {
        logger.warn(`Malformed input: ${csv}`)
      }
    }
  })

  return port
}
