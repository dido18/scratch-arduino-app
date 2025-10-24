# Scratch for Arduino Uno Q 

Getting started:
1. Connect the Arduino Uno Q board
2. Upload the `scratch-arduino-app` into the board:
``` sh
task app:upload
```
3. Start the App
  - via the ArduinoAppLab
  - via command line `arduino-app-cli app start user:scratch-arduino-app`

4. Open the `<IP_OR_BOARD_NAME>:7000`

### Local dev
- `task scratch:init`
- `task scratch:local:start`
- change the `const wsServerURL = `<YOUR_IP>:7000`;` in the `index.js` 
- Open local scratch on http://localhost:8601/