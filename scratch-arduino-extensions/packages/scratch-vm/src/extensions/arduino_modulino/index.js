const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const {ArduinoUnoQ} = require("../ArduinoUnoQ");

// TODO: add icons
const iconURI = "";
const menuIconURI = "";

class ArduinoModulino {
  constructor(runtime) {
    this.runtime = runtime;
    this.unoq = new ArduinoUnoQ();
    this.unoq.connect();

    // TODO: move to ModulinoPeripheral
    this._button_pressed = "";
    this.unoq.on("modulino_buttons_pressed", (data) => {
      console.log(`Modulino button pressed event received: ${data.btn}`);
      this._button_pressed = data.btn.toUpperCase();
    });
  }
}

ArduinoModulino.prototype.getInfo = function() {
  return {
    id: "arduinomodulino",
    name: "Arduino Modulino",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: "whenModulinoButtonsPressed",
        blockType: BlockType.HAT,
        text: "when modulino button [BTN] pressed",
        func: "whenModulinoButtonsPressed",
        arguments: {
          BTN: {
            type: ArgumentType.STRING,
            menu: "modulinoButtons",
            defaultValue: "A",
          },
        },
      },
    ],
    menus: {
      modulinoButtons: ["A", "B", "C"],
    },
  };
};

ArduinoModulino.prototype.whenModulinoButtonsPressed = function(args) {
  if (args.BTN === this._button_pressed) {
    this._button_pressed = "";
    return true;
  }
  return false;
};

module.exports = ArduinoModulino;
