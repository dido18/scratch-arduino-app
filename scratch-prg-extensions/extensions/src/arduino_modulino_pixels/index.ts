import {
  type Environment,
  extension,
  scratch,
  type RGBObject,
} from "$common";

import { createArduinoSocket } from "../arduino-socket";
import PixelsArgument from "./PixelsArgument.svelte";

const NUM_LEDS = 8;

export default class ModulinoPixels extends extension({
  name: "Pixels",
  description: "Control Arduino Modulino pixels",
  iconURL: "modulinos.png",
  insetIconURL: "modulino-buttons.svg",
  tags: ["Arduino", "Modulino"],
  blockColor: "#00878F",
  menuColor: "#8C7965",
  menuSelectColor: "#62AEB2",
}, "ui", "customArguments") {
  private socket: Socket | null = null;

  init(env: Environment) {
    this.socket = createArduinoSocket();
  }

  @scratch.command(function(_, tag) {
    const arg = this.makeCustomArgument({
      component: PixelsArgument,
      initial: {
        value: Array.from({ length: NUM_LEDS }, () => ({ r: 0, g: 0, b: 0 })) as RGBObject[],
        text: "pixels",
      },
    });
    return tag`Set pixels pattern ${arg}`;
  })
  setPixelsPattern(leds: RGBObject[]): void {
    if (!this.socket) return;
    leds.forEach((color, index) => {
      this.socket!.emit("pixels_set_rgb", {
        pixel: index,
        r: color.r,
        g: color.g,
        b: color.b,
      });
    });
  }

  @(scratch.command`Set all pixels to ${{ type: "color" }}`)
  setAllPixelsRGB(color: RGBObject): void {
    if (!this.socket) return;
    this.socket.emit("pixels_set_all_rgb", {
      r: color.r,
      g: color.g,
      b: color.b,
    });
  }

  @(scratch.command`Clear all pixels`)
  clearAllPixels(): void {
    if (!this.socket) return;
    this.socket.emit("pixels_clear_all", {});
  }
}
