import {
  type BlockUtilityWithID,
  type Environment,
  extension,
  type ExtensionMenuDisplayDetails,
  scratch,
} from "$common";
import { io, type Socket } from "socket.io-client";
import ButtonArgument from "./ButtonArgument.svelte";

// Get Arduino board IP or hostname from URL parameter
const getArduinoBoardHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardHost = urlParams.get("host");
  if (boardHost) {
    return boardHost;
  }
  return window.location.hostname;
};

export default class ModulinoButtons extends extension({
  name: "Modulino",
  description: "Control your Arduino Modulinos",
  iconURL: "modulinos.png", // png
  insetIconURL: "modulino-buttons.svg", // svg
  tags: ["Arduino UNO Q"],
  blockColor: "#00878F",
  menuColor: "#8C7965",
  menuSelectColor: "#62AEB2",
}, "customArguments") {
  private socket: Socket | null = null;
  private button_pressed: string = "";

  init(env: Environment) {
    const arduinoBoardHost = getArduinoBoardHost();
    var serverURL = `wss://${arduinoBoardHost}:7000`;

    this.socket = io(serverURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log(`Connected to Arduino UNO Q`, serverURL);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from Arduino UNO Q: ${reason}`);
    });

    this.socket.on("modulino_buttons_pressed", (data) => {
      console.log(`Modulino button pressed event received: ${data.btn}`);
      this.button_pressed = data.btn.toUpperCase();
    });
  }

  @scratch.hat(function(instance, tag) {
    const arg = instance.makeCustomArgument({
      component: ButtonArgument,
      initial: {
        value: "A",
        text: "A",
      },
    });
    return tag`When modulino button ${arg} pressed`;
  })
  whenModulinoButtonsPressed(button: string, util: BlockUtilityWithID) {
    if (button.toUpperCase() === this.button_pressed) {
      this.button_pressed = "";
      return true;
    }
    return false;
  }
}
