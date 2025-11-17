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


  // Create a heart pattern for 13x8 matrix (13 columns, 8 rows)
  private createHeartPattern(): number[][] {
    return [
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,7,7,0,0,0,0,0,7,7,0,0],
      [0,7,7,7,7,0,0,0,7,7,7,7,0],
      [7,7,7,7,7,7,0,7,7,7,7,7,7],
      [7,7,7,7,7,7,7,7,7,7,7,7,7],
      [0,7,7,7,7,7,7,7,7,7,7,7,0],
      [0,0,7,7,7,7,7,7,7,7,7,0,0],
      [0,0,0,7,7,7,7,7,7,7,0,0,0]
    ];
  }

  // Create a gradient pattern from bottom (7) to top (0)
  private createGradientPattern(): number[][] {
    return [
      [0,0,0,0,0,0,0,0,0,0,0,0,0], // Row 0: brightness 0
      [1,1,1,1,1,1,1,1,1,1,1,1,1], // Row 1: brightness 1
      [2,2,2,2,2,2,2,2,2,2,2,2,2], // Row 2: brightness 2
      [3,3,3,3,3,3,3,3,3,3,3,3,3], // Row 3: brightness 3
      [4,4,4,4,4,4,4,4,4,4,4,4,4], // Row 4: brightness 4
      [5,5,5,5,5,5,5,5,5,5,5,5,5], // Row 5: brightness 5
      [6,6,6,6,6,6,6,6,6,6,6,6,6], // Row 6: brightness 6
      [7,7,7,7,7,7,7,7,7,7,7,7,7]  // Row 7: brightness 7
    ];
  }


  @(scratch.command(function(_, tag) {
    const gradientMatrix = this.createGradientPattern();
    const arg = this.makeCustomArgument({
      component: MatrixArgument,
      initial: {
        value: gradientMatrix,
        text: "GRADIENT"
      }
    });
    return tag`draw ${arg} matrix`;
  }))
  drawMatrix(matrix: number[][]) {
    var matrixString = matrix.flat().join('');
    console.log("received matrix update", matrixString);
    // Send to socket if connected
    if (this.socket) {
      this.socket.emit("matrix_draw", { frame: matrixString });
    }
  }
}