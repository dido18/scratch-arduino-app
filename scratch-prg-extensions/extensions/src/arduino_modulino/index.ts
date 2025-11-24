import { scratch, extension, type ExtensionMenuDisplayDetails, type BlockUtilityWithID, type Environment } from "$common";
import { io, Socket } from "socket.io-client";

const details: ExtensionMenuDisplayDetails = {
  name: "Arduino Modulino",
  description: "Control Arduino Modulino via scratch",
  iconURL: "Replace with the name of your icon image file (which should be placed in the same directory as this file)",
  insetIconURL: "Replace with the name of your inset icon image file (which should be placed in the same directory as this file)",
  tags :["Arduino UNO Q"]
};

export default class ExtensionNameGoesHere extends extension(details) {

 button_pressed:string  = "";

 init(env: Environment) {

    const arduinoBoardHost = getArduinoBoardHost();
    var serverURL = `wss://${arduinoBoardHost}:7000`;

    console.log("Connecting to Uno Q", serverURL);

    this.socket = io(serverURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });


  }

  /** @see {ExplanationOfExampleHatAndBlockUtility} */
  @(scratch.hat(function (_, tag) {
      return tag`When modulino button ${{ type: "string", options: ["A", "B", "C"]}} pressed`;
    }))
  async whenModulinoButtonsPressed(button: string, util: BlockUtilityWithID) {
    // return util.stackFrame.isLoop === condition;
    return true;
  }
}

const getArduinoBoardHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardHost = urlParams.get("host");
  if (boardHost) {
    return boardHost;
  }
  return window.location.hostname;
};