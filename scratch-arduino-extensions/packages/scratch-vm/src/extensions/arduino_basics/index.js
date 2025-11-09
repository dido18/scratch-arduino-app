const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const ArduinoUnoQ = require("../ArduinoUnoQ");

// TODO: add icons
const iconURI = "";
const menuIconURI = "";

class ArduinoBasics {
  constructor(runtime) {
    this.runtime = runtime;
    this.unoq = new ArduinoUnoQ(`${window.location.hostname}`, 7000);
    this.unoq.connect();
  }
}

ArduinoBasics.prototype.getInfo = function() {
  return {
    id: "arduinobasics",
    name: "Arduino Basics",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: "matrixDraw",
        blockType: BlockType.COMMAND,
        text: "draw [FRAME] on matrix",
        func: "matrixDraw",
        arguments: {
          FRAME: {
            type: ArgumentType.MATRIX,
            defaultValue: "0101010101100010101000100",
          },
        },
      },
      {
        opcode: "matrixClear",
        blockType: BlockType.COMMAND,
        text: "clear matrix",
        func: "matrixClear",
        arguments: {},
      },
      {
        opcode: "setLed3",
        blockType: BlockType.COMMAND,
        text: "set LED 3 to [HEX]",
        func: "setLed3",
        arguments: {
          HEX: {
            type: ArgumentType.COLOR,
            defaultValue: "#ff0000",
          },
        },
      },
      {
        opcode: "setLed4",
        blockType: BlockType.COMMAND,
        text: "set LED 4 to [HEX]",
        func: "setLed4",
        arguments: {
          HEX: {
            type: ArgumentType.COLOR,
            defaultValue: "#0000ff",
          },
        },
      },
    ],
  };
};

ArduinoBasics.prototype.matrixDraw = function(args) {
  this.unoq.matrixDraw(args.FRAME);
};

ArduinoBasics.prototype.matrixClear = function() {
  this.unoq.matrixClear();
};

ArduinoBasics.prototype.setLed3 = function(args) {
  const hexColor = args.HEX;
  const rgb = this.hexToRgb(hexColor);
  this.unoq.setLedRGB("LED3", rgb.r, rgb.g, rgb.b);
};

ArduinoBasics.prototype.setLed4 = function(args) {
  const hexColor = args.HEX;
  const rgb = this.hexToRgb(hexColor);
  this.unoq.setLedRGB("LED4", rgb.r, rgb.g, rgb.b);
};

ArduinoBasics.prototype.hexToRgb = function(hex) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

module.exports = ArduinoBasics;
