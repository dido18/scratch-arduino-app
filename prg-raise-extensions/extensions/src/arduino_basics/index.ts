import { scratch, extension, type ExtensionMenuDisplayDetails, type BlockUtilityWithID, type Environment } from "$common";
import MatrixArgument from "./MatrixArgument.svelte";
import { io, Socket } from "socket.io-client";

const details: ExtensionMenuDisplayDetails = {
  name: "Arduino Basics",
  description: "Arduino Basics for Uno Q ",
  iconURL: "Replace with the name of your icon image file (which should be placed in the same directory as this file)",
  insetIconURL: "Replace with the name of your inset icon image file (which should be placed in the same directory as this file)"
};

const DEFAULT_HOST = "192.168.1.39";

// Pattern constants mapping names to matrix arrays
const PATTERNS = {
  heart: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,7,7,0,0,0,0,0,7,7,0,0],
    [0,7,7,7,7,0,0,0,7,7,7,7,0],
    [7,7,7,7,7,7,0,7,7,7,7,7,7],
    [7,7,7,7,7,7,7,7,7,7,7,7,7],
    [0,7,7,7,7,7,7,7,7,7,7,7,0],
    [0,0,7,7,7,7,7,7,7,7,7,0,0],
    [0,0,0,7,7,7,7,7,7,7,0,0,0]
  ] as number[][],

  gradient: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2,2,2,2],
    [3,3,3,3,3,3,3,3,3,3,3,3,3],
    [4,4,4,4,4,4,4,4,4,4,4,4,4],
    [5,5,5,5,5,5,5,5,5,5,5,5,5],
    [6,6,6,6,6,6,6,6,6,6,6,6,6],
    [7,7,7,7,7,7,7,7,7,7,7,7,7]
  ] as number[][],

// TODO  arduino: // TO


  empty: Array(8).fill(null).map(() => Array(13).fill(0)) as number[][]
} as const;

export default class ArduinoBasics extends extension(details, "ui", "customArguments") {
  private socket: Socket | null = null;

  init(env: Environment) {
    var serverURL = `wss://${DEFAULT_HOST}:7000`;  // Changed from wss to ws

    this.socket = io(serverURL, {
         path: "/socket.io",
         transports: ["polling", "websocket"],
         autoConnect: true,
   });

    this.socket.on("connect", () => {
      console.log(`Connected to Arduino UNO Q`);
    });

    // this.socket.on("disconnect", (reason) => {
    //       console.log(`Disconnected from Arduino UNO Q: ${reason}`);
    //     });
   }


  @(scratch.command(function(_, tag) {
    const pattern = PATTERNS.gradient;
    const arg = this.makeCustomArgument({
      component: MatrixArgument,
      initial: {
        value: pattern,
        text: "pattern"
      }
    });
    return tag`draw ${arg} matrix`;
  }))
  drawMatrix(matrix: number[][]) {
    var matrixString = matrix.flat().join('');
    console.log("received matrix update", matrixString);
    if (this.socket) {
      this.socket.emit("matrix_draw", { frame: matrixString });
    }
  }
}