# Scratch for Arduino Uno Q


## Description
> Arduino UNO Q + Scratch = ❤️

This is an Arduino App that runs Scratch on the board, enabling block-based interaction with the board.

Scratch for Arduino UNO Q runs Scratch directly on the board to control Arduino (e.g., LEDs, buttons, and Arduino Modulino) with optional AI model integration.
Accessible from any device via a browser, it makes coding, electronics, and AI hands-on and easy to explore.


![Scratch for Arduion UNO Q](./doc/scratch-unoq.png)


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
