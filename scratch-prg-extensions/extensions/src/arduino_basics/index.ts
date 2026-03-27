import { type Environment, extension, type ExtensionMenuDisplayDetails, scratch } from "$common";
import { type Socket } from "socket.io-client";
import { getArduinoSocket } from "../arduino-socket";
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
  private socket!: Socket;

  init(env: Environment) {
    this.socket = getArduinoSocket();
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
    var matrixString = matrix.flat().join("");
    console.log("received matrix update", matrixString);
    this.socket.emit("matrix_draw", { frame: matrixString });
  }

  @scratch.command`Clear matrix`
  clearMatrix(matrix: number[][]) {
    var matrixString = PATTERNS.empty.flat().join("");
    this.socket.emit("matrix_draw", { frame: matrixString });
  }
}
