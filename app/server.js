const Readline = require('@serialport/parser-readline')

module.exports = (SerialPort, handle) => {
  const port = new SerialPort('/dev/ttyACM0', {
    baudRate: 115200,
  })

  // port.on('open', () => {
  //   port.write('\r\r')
  // })

  const parser = port.pipe(new Readline({ delimiter: '\n' }))

  parser.on('data', data => {
    handle(data)
  })

  return port
}
