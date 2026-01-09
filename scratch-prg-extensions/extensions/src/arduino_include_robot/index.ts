import {
  type Environment,
  extension,
  scratch
} from "$common";

// import { io, type Socket } from "socket.io-client";

// Get Arduino board IP or hostname from URL parameter
const getArduinoBoardHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardHost = urlParams.get("host");
  if (boardHost) {
    return boardHost;
  }
  return window.location.hostname;
};

export default class IncludeRobot extends extension({
  name: "Include Robot",
  description: "A programmable robot designed to teach junior students about robotics in a simple and funny way.",
//   iconURL: "include-robot.png", // png
//   insetIconURL: "include-robot-buttons.svg", // svg
  tags: ["Arduino UNO Q"],
  blockColor: "#00878F",
  menuColor: "#8C7965",
  menuSelectColor: "#62AEB2",
}) {
//   private socket: Socket | null = null;

  init(env: Environment) {
    const arduinoBoardHost = getArduinoBoardHost();
    var serverURL = `wss://${arduinoBoardHost}:7000`;

    // this.socket = io(serverURL, {
    //   path: "/socket.io",
    //   transports: ["polling", "websocket"],
    //   autoConnect: true,
    // });

    // this.socket.on("connect", () => {
    //   console.log(`Connected to Arduino UNO Q`, serverURL);
    // });

    // this.socket.on("disconnect", (reason) => {
    //   console.log(`Disconnected from Arduino UNO Q: ${reason}`);
    // });
  }

    @(scratch.command`Move robot forward for ${"number"} steps`)
    robotForwardForSteps(steps: number) {
        if (this.socket) {
            this.socket.emit("robot_forward_for_steps", { steps: steps });
        }
    }

}
