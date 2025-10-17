// Option 1: Relative path to cousin folder
// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
const BlockType = require('../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type');

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

class Scratch3Arduino {
    constructor (runtime) {
        this.runtime = runtime;
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
                    opcode: 'example-noop',
                    blockType: BlockType.COMMAND,
                    text: 'do nothing',
                    func: 'noop'
                },
            ],
        };
}

Scratch3Arduino.prototype.noop = function () {
};

module.exports = Scratch3Arduino;