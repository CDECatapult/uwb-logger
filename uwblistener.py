#!/usr/bin/env python
#
# Very simple serial port listener
#

import serial
import time

ser = serial.Serial('/dev/ttyACM0', 115200, timeout=1)

print "Opened port: " + (ser.name)

#entering shell mode
ser.write(b'\r\r')

s = ser.read(100)
print s
time.sleep(3)
ser.write(b'lec\r')

while True:
    line = ser.read(100)
    if (len(line) > 0):
        print line

ser.close()
