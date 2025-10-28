// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
const BlockType = require('../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type');
const ArgumentType = require('../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type');
const io = require('../socket.io.min.js');

/**
 * Url of icon to be displayed at the left edge of each extension block.
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = '';

/**
 * Url of icon to be displayed in the toolbox menu for the extension category.
 * @type {string}
 */
// eslint-disable-next-line max-len
const menuIconURI = ''

// 'http://http://10.72.240.39:7000'

// const wsServerURL = `${window.location.protocol}//${window.location.hostname}:7000`;
const wsServerURL = `ws://192.168.1.39:7000`;

class ArduinoBasics {
  constructor(runtime) {
    this.runtime = runtime;

    this.io = io(wsServerURL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true
    });
  }
};

ArduinoBasics.prototype.getInfo = function () {
  return {
    id: 'arduinobasics',
    name: "Arduino Basics",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: 'matrixDraw',
        blockType: BlockType.COMMAND,
        text: 'draw [FRAME] on matrix',
        func: 'matrixDraw',
        arguments: {
          FRAME: {
            type: ArgumentType.MATRIX,
            defaultValue: '0101010101100010101000100'
          }
        }
      },
      {
        opcode: 'setLed3',
        blockType: BlockType.COMMAND,
        text: 'set LED 3 to [HEX]',
        func: 'setLed3',
        arguments: {
          HEX: {
            type: ArgumentType.COLOR,
            defaultValue: '#ff0000'
          }
        }
      },
       {
        opcode: 'setLed4',
        blockType: BlockType.COMMAND,
        text: 'set LED 4 to [HEX]',
        func: 'setLed4',
        arguments: {
          HEX: {
            type: ArgumentType.COLOR,
            defaultValue: '#ff0000'
          }
        }
      }
    ]
  };
}

ArduinoBasics.prototype.matrixDraw = function (args) {
  console.log(`Drawing frame on matrix: ${args}`);
  this.io.emit("matrix_draw", { frame: args.FRAME });
};

ArduinoBasics.prototype.setLed3 = function (args) {
  const hexColor = args.HEX;
  const rgb = this.hexToRgb(hexColor);
  console.log(`Setting led 3 to: r:${rgb.r}, g:${rgb.g}, b:${rgb.b} (HEX: ${hexColor})`);
  this.io.emit("set_led_rgb", {led: "LED3", r: rgb.r, g: rgb.g,b: rgb.b});
};

ArduinoBasics.prototype.setLed4 = function (args) {
  const hexColor = args.HEX;
  const rgb = this.hexToRgb(hexColor);
  console.log(`Setting led 4 to: r:${rgb.r}, g:${rgb.g}, b:${rgb.b} (HEX: ${hexColor})`);
  this.io.emit("set_led_rgb", {led: "LED4", r: rgb.r, g: rgb.g,b: rgb.b});
};

ArduinoBasics.prototype.hexToRgb = function (hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

module.exports = ArduinoBasics;
