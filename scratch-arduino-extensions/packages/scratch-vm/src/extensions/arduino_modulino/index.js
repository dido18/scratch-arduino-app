const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");

/**
 * Url of icon to be displayed at the left edge of each extension block.
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = "";

/**
 * Url of icon to be displayed in the toolbox menu for the extension category.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = "";

const wsServerURL = `${window.location.protocol}//${window.location.hostname}:7000`;

class ArduinoModulino {
  constructor(runtime) {
    this.runtime = runtime;
    this.io = io(wsServerURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    // TODO: move to ModulinoPeripheral
    this._button_pressed = "";
    this.io.on("modulino_buttons_pressed", (data) => {
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
