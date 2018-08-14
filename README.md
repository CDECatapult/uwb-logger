# JIT-AI UWB client

This code run on a raspberry pi.
It reads the coordinates from the UWB through serial port and store them in a database.

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

DWM1001 TWR Real Time Location System
