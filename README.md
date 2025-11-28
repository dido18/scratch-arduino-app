# Scratch for Arduino Uno Q

> Arduino UNO Q + Scratch = ❤️

## Description

Scratch for Arduino UNO Q is an Arduino App that runs Scratch directly on the board to control physical world (e.g., LEDs, buttons, and Arduino Modulino) with optional AI model integration.
Accessible from any device via a browser, it makes coding, electronics, and AI hands-on and easy to explore.

![Scratch for Arduion UNO Q](./doc/scratch-unoq.png)

## Installation

- Open the Arduino App lab and connect to your UNO Q board.
- Clik on the button "open terminal" (button left)
- Copy and paste the following command into the terminal to install the latest `scratch-arduino-app`:

```
curl -sSL https://raw.githubusercontent.com/dido18/scratch-arduino-app/main/install.sh | bash
```

- Open the Scratch interface at the `https://<IP_OR_BOARD_NAME>:7000` address.

NOTE: the `https` is needed by the `getUserMedia()` method for security reason.

## Local development

- `task scratch:init`
- `task watch` watch python, sketch and scratch GUI files and reload on save
- Open the `http://localhost:8602?host=BOARD_IP`

For upload the current version into the board

- `ŧask app:upload`
