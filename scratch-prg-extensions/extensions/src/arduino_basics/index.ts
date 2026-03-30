import { type Environment, extension, type ExtensionMenuDisplayDetails, scratch } from "$common";
import { type ArduinoBoard, ConnectArduinoBoard } from "../commonArduinoBoard";
import MatrixArgument from "./MatrixArgument.svelte";

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


  @scratch.command`Servo attach to ${{ type:"number", defaultValue:0, options:[0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }} pin`
   servoAttach(pin: number) {
    this.board.socket.emit("attach_servo", {
      pin: pin,
    });
   }

  @scratch.command`Servo write to ${{ type:"number", defaultValue:0, options:[0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }} pin value ${{ type:"number", defaultValue: 90}}`
   servoWrite(pin: number, value :number) {
    this.board.socket.emit("write_servo", {
      pin: pin,
      value: value,
    });
   }

}
