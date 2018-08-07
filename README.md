# JIT-AI UWB client

This code run on a raspberry pi.
It reads the coordinates from the UWB through serial port and store them in a remote PGSQL.

## Installation

This package require node 8+ and yarn:

Node:

    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    sudo apt-get install -y nodejs

Yarn:

    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update && sudo apt-get install yarn

## TODO

- Error handling (try to reconnect)
- Add sentry
- Enter shell mode etc

## Hardware

DWM1001 TWR Real Time Location System
Copyright : 2016-2017 LEAPS and Decawave
License : Please visit https://decawave.com/dwm1001_license
Compiled : Nov 2 9 2017 13:35:02
Help : ? or help