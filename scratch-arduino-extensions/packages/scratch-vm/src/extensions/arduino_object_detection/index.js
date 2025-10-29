// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
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

class arduinoObjectDetection {
  constructor(runtime) {
    this.runtime = runtime;

    this.io = io(wsServerURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });
  }
}

arduinoObjectDetection.prototype.getInfo = function() {
  return {
    id: "arduinoObjectDetection",
    name: "Arduino Object Detection",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: "enableVideo",
        blockType: BlockType.COMMAND,
        text: "enable video",
        func: "enableVideo",
        arguments: {}
      },
       {
        opcode: "disableVideo",
        blockType: BlockType.COMMAND,
        text: "disable video",
        func: "disableVideo",
        arguments: {}
      },
    ],
  };
};

arduinoObjectDetection.prototype.enableVideo = async function(args) {
   this.runtime.ioDevices.video.enableVideo();

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < 10; i++) {
        if (this.runtime.ioDevices) {
            const frame = this.runtime.ioDevices.video.getFrame({format: 'image-data'});
            // Sleep for 1 second (1000ms) after each frame
            console.log(`Processed frame ${i + 1}`, frame);
            this.io.emit('detect_objects', {image: frame});
            await sleep(1000);
        }
    }

};

arduinoObjectDetection.prototype.disableVideo = function(args) {
   this.runtime.ioDevices.video.disableVideo();
};

module.exports = arduinoObjectDetection;
