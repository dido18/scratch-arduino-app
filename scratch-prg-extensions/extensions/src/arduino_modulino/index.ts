import {
  type BlockUtilityWithID,
  type Environment,
  extension,
  type ExtensionMenuDisplayDetails,
  scratch,
} from "$common";
import { ConnectArduinoBoard, type ArduinoBoard } from "../arduinoBoard";
import ButtonArgument from "./ButtonArgument.svelte";

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
  private board!: ArduinoBoard;
  private button_pressed: string = "";

  init(env: Environment) {
    this.board = ConnectArduinoBoard();

    this.board.socket.on("modulino_buttons_pressed", (data) => {
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
