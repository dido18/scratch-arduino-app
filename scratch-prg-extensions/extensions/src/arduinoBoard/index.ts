import { io, type Socket } from "socket.io-client";

export class ArduinoBoard {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  drawMatrix(matrix: MatrixFrame): void {
      const matrixString = matrix.flat().join("");
      this.socket.emit("matrix_draw", { frame: matrixString });
  }
}

export function ConnectArduinoBoard(): ArduinoBoard {
  var arduinoBoardHost = window.location.hostname;
  const hostParam = new URLSearchParams(window.location.search).get("host");
  if (hostParam) {
     arduinoBoardHost = hostParam;
  }

  const serverURL = `wss://${arduinoBoardHost}:7000`;

  console.log("Connecting to Uno Q", serverURL);

  const socket = io(serverURL, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log(`Connected to Arduino UNO Q at ${serverURL}`);
  });

  socket.on("disconnect", (reason: string) => {
    console.log(`Disconnected from Arduino UNO Q: ${reason}`);
  });

  return new ArduinoBoard(socket);
};

export type MatrixFrame = number[][];