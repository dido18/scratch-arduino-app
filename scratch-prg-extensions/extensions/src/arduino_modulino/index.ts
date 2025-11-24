import { scratch, extension, type ExtensionMenuDisplayDetails, type BlockUtilityWithID, type Environment } from "$common";
import { io, type Socket } from "socket.io-client";

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

export default class ExtensionNameGoesHere extends extension(details) {

 private socket: Socket | null = null;
 private button_pressed:string  = "";

 init(env: Environment) {
    const arduinoBoardHost = getArduinoBoardHost();
    var serverURL = `wss://${arduinoBoardHost}:7000`;

    console.log("Connecting to Uno Q", serverURL);

    this.socket = io(serverURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

     this.socket.on("modulino_buttons_pressed", (data) => {
      console.log(`Modulino button pressed event received: ${data.btn}`);
      this.button_pressed = data.btn.toUpperCase();
    });

  }

  /** @see {ExplanationOfExampleHatAndBlockUtility} */
  @scratch.hat(function (_: any, tag: any) {
      return tag`When modulino button ${{ type: "string", options: ["A", "B", "C"]}} pressed`;
    })
  async whenModulinoButtonsPressed(button: string, util: BlockUtilityWithID) {
    if (button === this.button_pressed) {
        this.button_pressed = "";
        return true;
    }
    return false;
  }
}