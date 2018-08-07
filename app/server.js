const Readline = require('@serialport/parser-readline')
const Ready = require('@serialport/parser-ready')

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

  port.on('open', () => {
    port.write('\r\r', portDidOpen)
  })

  const parser = port
    .pipe(new Ready({ delimiter: 'READY' }))
    .pipe(new Readline({ delimiter: '\n' }))

  parser.on('data', data => {
    console.log('data', data)
    const coordinates = parseCoordinates(data)

    dbClient.saveCoordinates(coordinates)
  })

  return port
}
