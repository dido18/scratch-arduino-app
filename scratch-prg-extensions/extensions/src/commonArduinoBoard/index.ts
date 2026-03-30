import { io, type Socket } from "socket.io-client";

export class ArduinoBoard {
  socket: Socket;
  connectedModulinos: string[] = [];

  constructor(socket: Socket) {
    this.socket = socket;

    this.socket.on("modulino_connected", (data) => {
        console.log(`Modulinos connected ${data.modulinos}`);
        this.connectedModulinos = data.modulinos;
    });
  }

  isModulinoPixedConnected(): boolean {
    return this.connectedModulinos.includes("Smartleds");
  }

  drawMatrix(matrix: MatrixFrame): void {
    const matrixString = matrix.flat().join("");
    this.socket.emit("matrix_draw", { frame: matrixString });
  }

  modulinoPixelsSetAllRGB(r: number, g: number, b: number): void {
    this.socket.emit("pixels_set_all_rgb", {
      r: r,
      g: g,
      b: b,
    });
  }

  modulinoPixelsSetRGB(idx: number, r: number, g: number, b: number): void {
    this.socket.emit("pixels_set_rgb", {
      idx: idx,
      r: r,
      g: g,
      b: b,
    });
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
    console.log(`OLL Connected to Arduino UNO Q at ${serverURL}`);
  });

  socket.on("disconnect", (reason: string) => {
    console.log(`Disconnected from Arduino UNO Q: ${reason}`);
  });

  return new ArduinoBoard(socket);
}

export type MatrixFrame = number[][];
