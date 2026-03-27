import { io, type Socket } from "socket.io-client";

let _socket: Socket | null = null;

export const getArduinoSocket = (): Socket => {
  if (_socket !== null) {
    return _socket;
  }

  var arduinoBoardHost = window.location.hostname;
  const hostParam = new URLSearchParams(window.location.search).get("host");
  if (hostParam) {
     arduinoBoardHost = hostParam;
  }

  const serverURL = `wss://${arduinoBoardHost}:7000`;

  console.log("Connecting to Uno Q", serverURL);

  _socket = io(serverURL, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    autoConnect: true,
  });

  _socket.on("connect", () => {
    console.log(`Connected to Arduino UNO Q at ${serverURL}`);
  });

  _socket.on("disconnect", (reason: string) => {
    console.log(`Disconnected from Arduino UNO Q: ${reason}`);
  });

  return _socket;
};
