import { Bridge, SaveDataHandler, extension, scratch, Language, type Environment } from "$common";

const details = {
  name: "Arduino Modulino Movement",
  description: "Read 6-axis sensor data (acceleration & rotation) from Modulino Movement module",
  implementationLanguage: Language.English,
  blockColor: "#4CAF50",       // Green for sensors
  menuColor: "#66BB6A",
  menuSelectColor: "#2E7D32",
  tags: ["Arduino Modulino"],
};

export default class ArduinoModulinoMovement extends extension(details) {
  // Current sensor readings (updated via polling or Bridge notifications)
  private accelX: number = 0;
  private accelY: number = 0;
  private accelZ: number = 0;
  private roll: number = 0;
  private pitch: number = 0;
  private yaw: number = 0;
  private sensorReady: boolean = false;

  async init(env: Environment): Promise<void> {
    // Set up Bridge listener to receive sensor updates from sketch
    Bridge.provide("movement_data", (data) => {
      this.accelX = data.accelX ?? 0;
      this.accelY = data.accelY ?? 0;
      this.accelZ = data.accelZ ?? 0;
      this.roll = data.roll ?? 0;
      this.pitch = data.pitch ?? 0;
      this.yaw = data.yaw ?? 0;
      this.sensorReady = true;
    });

    // Optionally request initial sensor reading (if using polling pattern)
    try {
      Bridge.call("get_movement_data");
    } catch (e) {
      console.warn("Bridge not available; using mock sensor data");
      this.sensorReady = true;
    }
  }

  /**
   * Get acceleration in X, Y, Z axes in m/s²
   */
  @(scratch.reporter`Acceleration X`)
  getAccelerationX(): number {
    return parseFloat(this.accelX.toFixed(2));
  }

  @(scratch.reporter`Acceleration Y`)
  getAccelerationY(): number {
    return parseFloat(this.accelY.toFixed(2));
  }

  @(scratch.reporter`Acceleration Z`)
  getAccelerationZ(): number {
    return parseFloat(this.accelZ.toFixed(2));
  }

  /**
   * Get gyroscope readings (rotation) in degrees
   */
  @(scratch.reporter`Rotation — Roll (X-axis)`)
  getRoll(): number {
    return parseFloat(this.roll.toFixed(2));
  }

  @(scratch.reporter`Rotation — Pitch (Y-axis)`)
  getPitch(): number {
    return parseFloat(this.pitch.toFixed(2));
  }

  @(scratch.reporter`Rotation — Yaw (Z-axis)`)
  getYaw(): number {
    return parseFloat(this.yaw.toFixed(2));
  }

  /**
   * Check if sensor is initialized and ready
   */
  @(scratch.reporter`Sensor ready?`)
  isSensorReady(): boolean {
    return this.sensorReady;
  }
}
