const io = require("./socket.io.min.js");

class ArduinoUnoQ {
  constructor(host, port) {
    this.serverURL = `wss://${host}:${port}`;

    this.io = io(this.serverURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });
    this.isConnected = false;

    this._setupConnectionHandlers();
  }

  _setupConnectionHandlers() {
    this.io.on("connect", () => {
      this.isConnected = true;
      console.log(`Connected to Arduino UNO Q at ${this.serverURL}`);
    });

    this.io.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log(`Disconnected from Arduino UNO Q: ${reason}`);
    });

    this.io.on("connect_error", (error) => {
      console.error(`Connection error:`, error.message);
    });

    this.io.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected to Arduino UNO Q after ${attemptNumber} attempts`);
    });
  }

  connect() {
    if (!this.io.connected) {
      console.log("Attempting to connect to Arduino UNO Q...");
      this.io.connect();
    }
  }

  disconnect() {
    if (this.io.connected) {
      console.log("Disconnecting from Arduino UNO Q...");
      this.io.disconnect();
    }
  }

  // ===== LED CONTROL METHODS =====
  /**
   * Set RGB LED color
   * @param {string} led - LED identifier ("LED3" or "LED4")
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   */
  setLedRGB(led, r, g, b) {
    this.io.emit("set_led_rgb", {
      led: led,
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b)),
    });
    console.log(`Setting ${led} to RGB(${r}, ${g}, ${b})`);
  }

  /**
   * Turn off LED
   * @param {string} led - LED identifier ("LED3" or "LED4")
   */
  turnOffLed(led) {
    this.setLedRGB(led, 0, 0, 0);
  }

  // ===== MATRIX CONTROL METHODS =====

  /**
   * Draw frame on LED matrix
   * @param {string} frame - 25-character string representing 5x5 matrix (0s and 1s)
   */
  matrixDraw(frame) {
    if (typeof frame !== "string" || frame.length !== 25) {
      console.error("Invalid frame format. Expected 25-character string of 0s and 1s");
      return;
    }
    // Validate frame contains only 0s and 1s
    if (!/^[01]+$/.test(frame)) {
      console.error("Frame must contain only 0s and 1s");
      return;
    }

    this.io.emit("matrix_draw", { frame: frame });
    console.log(`Drawing matrix frame: ${frame}`);
  }

  matrixClear() {
    const clearFrame = "0".repeat(25);
    this.matrixDraw(clearFrame);
  }
}

module.exports = ArduinoUnoQ;
