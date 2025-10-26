# Scratch for Arduino Uno Q 

## Installation

- Connect to the board using `adb` following https://docs.arduino.cc/software/app-lab/tutorials/cli/ and open the `adb shell`
- From inside the board, Install the latest `scratch-arduino-app` into the board running the command:
```
curl -sSL https://raw.githubusercontent.com/dido18/scratch-arduino-app/main/install.sh | bash
```
- Open the `ArduinoAppLab` and start the app
- Visit the `<IP_OR_BOARD_NAME>:7000` to open the Scratch App.

### Local development
- `task scratch:init`
- `task scratch:local:start`
- change the `const wsServerURL = `<YOUR_IP>:7000`;` in the `index.js` 
- Open local scratch on http://localhost:8601/