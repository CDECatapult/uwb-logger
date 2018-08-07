const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

module.exports = () => {
  const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200,
  })

  // port.on('open', () => {
  //   port.write('\r\r')
  // })

  const parser = port.pipe(new Readline({ delimiter: '\n' }))

  parser.on('data', data => {
    console.log(data)
  })

  return port
}
