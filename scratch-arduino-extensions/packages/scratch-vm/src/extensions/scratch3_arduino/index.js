// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
const BlockType = require('../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type');
const ArgumentType = require('../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type');
const io = require('./socket.io.min.js');

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
const menuIconURI =  ''

const wsServerURL = 'http://192.168.1.39:7000';

class Scratch3Arduino {
    constructor (runtime) {
        this.runtime = runtime;
        this.io = io(wsServerURL, {
            path: '/socket.io',
            transports: ['polling','websocket'],
            autoConnect: true
        });

        // TODO: move to ModulinoPeripheral
        this._button_a_pressed = false;
        this._button_b_pressed = false;
        this._button_c_pressed = false;

        this.io.on('modulino_buttons_pressed', (data) => {
            console.log(`Modulino button pressed event received: ${data.btn}`);
            if (data.btn.toUpperCase() == 'A'){
                this._button_a_pressed = true;
                this._button_b_pressed = false;
                this._button_c_pressed = false;
                return;
            }
            if (data.btn.toUpperCase() == 'B'){
                this._button_a_pressed = false;
                this._button_b_pressed = true;
                this._button_c_pressed = false;
                return;
            }
            if (data.btn.toUpperCase() == 'C'){
                this._button_a_pressed = false;
                this._button_b_pressed = false;
                this._button_c_pressed = true;
                return;
            }
            return;
        });
   }
};

Scratch3Arduino.prototype.getInfo = function () {
        return {
            id: 'arduino',
            name: "Arduino",
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
                    opcode: 'whenModulinoButtonsPressed',
                    blockType: BlockType.HAT,
                    text:  'when modulino button [BTN] pressed',
                    func: 'whenModulinoButtonsPressed',
                    arguments: {
                        BTN: {
                            type: ArgumentType.STRING,
                            menu: 'modulinoButtons',
                            defaultValue: "A"
                        }
                    }
                },
            ],
            menus: {
                modulinoButtons: ["A", "B", "C"]
            }
        };
}

Scratch3Arduino.prototype.matrixDraw = function (args) {
    console.log(`Drawing frame on matrix: ${args}`);
    this.io.emit("matrix_draw", {frame: args.FRAME});
};

Scratch3Arduino.prototype.whenModulinoButtonsPressed = function (args) {
     if (args.BTN === 'A') {
        return this._button_a_pressed
     } else if (args.BTN === 'B') {
        return this._button_b_pressed
    } else if (args.BTN === 'C') {
        return this._button_c_pressed;
    }
    return false;
};

module.exports = Scratch3Arduino;