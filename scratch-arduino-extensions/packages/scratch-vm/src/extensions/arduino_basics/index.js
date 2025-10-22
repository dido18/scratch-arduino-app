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

const wsServerURL = `${window.location.protocol}//${window.location.hostname}:7000`;

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
      }
    ]
  };
}

ArduinoBasics.prototype.matrixDraw = function (args) {
  console.log(`Drawing frame on matrix: ${args}`);
  this.io.emit("matrix_draw", { frame: args.FRAME });
};

module.exports = ArduinoBasics;
