import { type Environment, extension, type ExtensionMenuDisplayDetails, scratch } from "$common";
import { io, Socket } from "socket.io-client";
import MatrixArgument from "./MatrixArgument.svelte";

const details: ExtensionMenuDisplayDetails = {
  name: "Arduino Basics",
  description: "Arduino Basics for Uno Q",
  iconURL: "ArduinoLogo_Blue.png",
  insetIconURL: "ArduinoLogo_Blue.jpg",
  //   tags: ["Arduino"],
  blockColor: "#00878F",
  menuColor: "#62AEB2",
  menuSelectColor: "#62AEB2",
};

// Get Arduino board IP or hostname from URL parameter
const getArduinoBoardHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardHost = urlParams.get("host");
  if (boardHost) {
    return boardHost;
  }
  return window.location.hostname;
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
  empty: Array(8).fill(null).map(() => Array(13).fill(0)) as number[][],
} as const;

export default class ArduinoBasics extends extension(details, "ui", "customArguments") {
  private socket: Socket | null = null;

  init(env: Environment) {
    const arduinoBoardHost = getArduinoBoardHost();
    var serverURL = `wss://${arduinoBoardHost}:7000`;

    this.socket = io(serverURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log(`Connected to Arduino UNO Q`);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from Arduino UNO Q: ${reason}`);
    });
  }

  @scratch.command(function(_, tag) {
    const pattern = PATTERNS.heart;
    const arg = this.makeCustomArgument({
      component: MatrixArgument,
      initial: {
        value: pattern,
        text: "heart",
      },
    });
    return tag`draw ${arg} matrix`;
  })
  drawMatrix(matrix: number[][]) {
    var matrixString = matrix.flat().join("");
    console.log("received matrix update", matrixString);
    if (this.socket) {
      this.socket.emit("matrix_draw", { frame: matrixString });
    }
  }

  @scratch.command`Clear matrix`
  clearMatrix(matrix: number[][]) {
    var matrixString = PATTERNS.empty.flat().join("");
    if (this.socket) {
      this.socket.emit("matrix_draw", { frame: matrixString });
    }
  }
}
