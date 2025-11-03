# Scratch for Arduino Uno Q

![Scratch for Arduion UNO Q](./doc/scratch-unoq.png)

## Description

This is an Arduino application that runs Scratch directly on the board, enabling block-based programming for hardware projects.
Simply connect your Arduino UNOQ, install the app, and start programming with drag-and-drop blocks while having full access to hardware capabilities and AI features.

## Installation

- Open an `adb shell` into the board ([doc](https://docs.arduino.cc/software/app-lab/tutorials/cli/)
- Copy and paste the following command into the terminal to install the latest `scratch-arduino-app` into the board:
```
curl -sSL https://raw.githubusercontent.com/dido18/scratch-arduino-app/main/install.sh | bash
```
- Open the Scratch Iterface at the `<IP_OR_BOARD_NAME>:7000` address

### Local development

- `task scratch:init`
- `task scratch:local:start`
- `ŧask board:upload`
- change the `const wsServerURL =`ws://<YOUR_IP>:7000`;` in the `index.js`
- Open local scratch on http://localhost:8601/
