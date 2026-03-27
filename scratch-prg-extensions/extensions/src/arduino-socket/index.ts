import { io, type Socket } from "socket.io-client";


export const getArduinoBoardHost = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardHost = urlParams.get("host");
  if (boardHost) {
    return boardHost;
  }
  return window.location.hostname;
};


export const createArduinoSocket = () : Socket => {
  const arduinoBoardHost = getArduinoBoardHost();

  var serverURL = `wss://${arduinoBoardHost}:7000`;

 console.log("Connecting to Uno Q", serverURL);

 const socket = io(serverURL, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    autoConnect: true,
 });

  // Default event handlers
  socket.on("connect", () => {
    console.log(`Connected to Arduino UNO Q at ${serverURL}`);
  });

  socket.on("disconnect", (reason: string) => {
    console.log(`Disconnected from Arduino UNO Q: ${reason}`);
  });

  return socket;
};
