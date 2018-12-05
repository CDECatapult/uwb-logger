[![CircleCI](https://circleci.com/gh/CDECatapult/uwb-logger.svg?style=svg)](https://circleci.com/gh/CDECatapult/uwb-logger)
[![Known Vulnerabilities](https://snyk.io/test/github/CDECatapult/uwb-logger/badge.svg)](https://snyk.io/test/github/CDECatapult/uwb-logger)

# JIT-AI UWB client

This code run on a raspberry pi.
It reads the coordinates from the UWB through serial port and store them in a remote database.

## Architecture

```
                         +--------------------------------------------------+
                         |                                                  |
+----------------+       |    +----------------+          +------------+    |
|                |       |    |                |          |            |    |
|  Database      |       |    |  Raspberry PI  |  serial  |  Decawave  |    |
|  (PostGreSQL)  | <--------+ |  (Linux)       | <------+ |  device    |    |
|                |       |    |                |          |            |    |
+----------------+       |    +----------------+          +------------+    |
                         |                                                  |
       AWS               |                      WLAN                        |
                         |                                                  |
                         +--------------------------------------------------+
```

## Installation

This package require node 8+ and yarn:

Node:

    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt-get install -y nodejs

Yarn:

    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn

## Hardware

DWM1001 TWR Real Time Location System.

There are two ways to connect to the Decawave HW: UART or SPI.
This project uses the UART through /dev/ttyACM0
It then enters the shell mode by printing 2 CR in less than one second and send
the `lec` command to listen to the positions.

- [User guide](https://www.decawave.com/wp-content/uploads/2018/08/dwm1001_firmware_user_guide.pdf)
- [API guide](https://www.decawave.com/wp-content/uploads/2018/08/dwm1001-api-guide.pdf)
