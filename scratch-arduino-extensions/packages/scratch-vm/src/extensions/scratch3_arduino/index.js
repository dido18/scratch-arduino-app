// const formatMessage = require('format-message');
// const formatMessage = require('../../../../node_modules/format-message');


/**
 * Url of icon to be displayed at the left edge of each extension block.
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = '' 

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

    getInfo () {
        return {
            id: 'arduino',
            name: {
                id: 'arduino.extensionName',
                default: 'Arduino',
                description: 'Add Arduino blocks to Scratch.'
            },
            menuIconURI: menuIconURI,
            blockIconURI: iconURI,
            blocks: [ ],
        };
    }
}
module.exports = Scratch3Arduino;