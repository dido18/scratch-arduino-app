import { type Environment, extension, type RGBObject, scratch } from "$common";
import { ArduinoBoard, ConnectArduinoBoard } from "../commonArduinoBoard";

export default class ModulinoPixels extends extension(
  {
    name: "Pixels",
    description: "Control Arduino Modulino Pixels",
    iconURL: "modulino-pixels.png",
    insetIconURL: "modulino-pixels.svg",
    tags: ["Arduino Modulino"],
    blockColor: "#00878F",
    menuColor: "#8C7965",
    menuSelectColor: "#62AEB2",
  },
  "ui",
  "customArguments",
) {
  private board!: ArduinoBoard;

  init(env: Environment) {
    this.board = ConnectArduinoBoard();
  }

  @scratch.command`Set pixel ${{ type: "number" }} to ${{ type: "color" }}`
  setPixelRGB(idx: number, color: RGBObject): void {
    this.board.modulinoPixelsSetRGB(idx, color.r, color.g, color.b);
  }

  @scratch.command`Set all pixels to ${{ type: "color" }}`
  setAllPixelsRGB(color: RGBObject): void {
    this.board.modulinoPixelsSetAllRGB(color.r, color.g, color.b);
  }

  @scratch.command`Clear all pixels`
  clearAllPixels(): void {
    this.board.modulinoPixelsSetAllRGB(0, 0, 0);
  }
}
