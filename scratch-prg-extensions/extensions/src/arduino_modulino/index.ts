import { scratch, extension, type ExtensionMenuDisplayDetails, type BlockUtilityWithID, type Environment } from "$common";
import { io, type Socket } from "socket.io-client";
import ButtonArgument from "./ButtonArgument.svelte";

const details: ExtensionMenuDisplayDetails = {
  name: "Arduino Modulino",
  description: "Control Arduino Modulino via scratch",
  iconURL: "Replace with the name of your icon image file (which should be placed in the same directory as this file)",
  insetIconURL: "Replace with the name of your inset icon image file (which should be placed in the same directory as this file)",
  tags :["Arduino UNO Q"]
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

export default class ModulinoButtons extends extension(details, "customArguments") {

 private socket: Socket | null = null;
 private button_pressed:string  = "";

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
      console.log(`Set button_pressed to: "${this.button_pressed}"`);
    });

  }


 @(scratch.hat(function (instance, tag) {
    const arg = instance.makeCustomArgument({
      component: ButtonArgument,
      initial: {
        value: "A",
        text: "Button A",
      },
    });
    return tag`When modulino ${arg} pressed`;
  }))
  whenModulinoButtonsPressed(button: string, util: BlockUtilityWithID) {
    if ( button.toUpperCase() === this.button_pressed) {
        this.button_pressed = "";
        return true;
    }
    return false;
  }
}