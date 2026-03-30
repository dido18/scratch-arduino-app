import { type Environment, extension, type ExtensionMenuDisplayDetails, scratch } from "$common";
import { type ArduinoBoard, ConnectArduinoBoard } from "../commonArduinoBoard";
import MatrixArgument from "./MatrixArgument.svelte";
import ServoPinArgument from "./ServoPinArgument.svelte";

const details: ExtensionMenuDisplayDetails = {
  name: "Basic",
  description: "Play with UNO Q matrix, leds and pins",
  iconURL: "matrix.png",
  insetIconURL: "unoq.svg",
  tags: ["Arduino UNO Q"],
  blockColor: "#00878F",
  menuColor: "#8C7965",
  menuSelectColor: "#62AEB2",
};

// TODO: make the block to support the brightness `0-7' of the leds
const PATTERNS = {
  heart: [
    [0, 0, 0, 7, 7, 0, 0, 0, 7, 7, 0, 0, 0],
    [0, 0, 7, 0, 0, 7, 0, 7, 0, 0, 7, 0, 0],
    [0, 7, 0, 0, 0, 0, 7, 0, 0, 0, 0, 7, 0],
    [0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0],
    [0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0],
    [0, 0, 0, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0],
    [0, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 7, 0, 7, 0, 0, 0, 0, 0],
  ] as number[][],
  arduino: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 7, 7, 7, 0, 0, 0, 7, 7, 7, 0, 0],
    [0, 7, 0, 0, 0, 7, 0, 7, 0, 0, 0, 7, 0],
    [7, 0, 0, 0, 0, 0, 7, 0, 0, 7, 0, 0, 7],
    [7, 0, 7, 7, 7, 0, 7, 0, 7, 7, 7, 0, 7],
    [7, 0, 0, 0, 0, 0, 7, 0, 0, 7, 0, 0, 7],
    [0, 7, 0, 0, 0, 7, 0, 7, 0, 0, 0, 7, 0],
    [0, 0, 7, 7, 7, 0, 0, 0, 7, 7, 7, 0, 0],
  ] as number[][],
  empty: Array(8).fill(null).map(() => Array(13).fill(0)) as number[][],
} as const;

export default class ArduinoBasics extends extension(details, "ui", "customArguments") {
  private board!: ArduinoBoard;

  init(env: Environment) {
    this.board = ConnectArduinoBoard();
  }

  @scratch.command(function(_, tag) {
    const arg = this.makeCustomArgument({
      component: MatrixArgument,
      initial: {
        value: PATTERNS.arduino,
        text: "arduino",
      },
    });
    return tag`draw ${arg} matrix`;
  })
  drawMatrix(matrix: number[][]) {
    this.board.drawMatrix(matrix);
  }

  @scratch.command`Clear matrix`
  clearMatrix() {
    this.board.drawMatrix(PATTERNS.empty);
  }

  @scratch.command(function(_, tag) {
    const pinArg = this.makeCustomArgument({
      component: ServoPinArgument,
      initial: { value: 3, text: "~D3" },
    });
    return tag`Set servo pin ${pinArg} angle to ${{ type: "number", defaultValue: 90 }}`;
  })
  servoWrite(pin: number, angle: number) {
    this.board.socket.emit("servo_write", {
      pin: pin,
      angle: angle,
    });
  }
}
