// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");
const Video = require('../../../../../../scratch-editor/packages/scratch-vm/src/io/video');

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

const wsServerURL = `ws://192.168.1.39:7000`;

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

arduinoObjectDetection.prototype.enableVideo = function(args) {
   this.runtime.ioDevices.video.enableVideo();

    if (this.runtime.ioDevices) {
        // Get frame as canvas for base64 conversion
        const canvas = this.runtime.ioDevices.video.getFrame({
            format: Video.FORMAT_CANVAS,
            dimensions: [320, 240]
        });

        if (canvas) {
            // Convert canvas to base64 PNG (lossless) or JPEG (smaller file)
            const base64Frame = canvas.toDataURL('image/png'); // PNG format
            // Alternative: canvas.toDataURL('image/jpeg', 0.8); // JPEG format with 80% quality
            this.io.emit('detect_objects', { image: base64Frame });
            console.log(`Processed frame in base64`, base64Frame.substring(0, 100) + '...');
        } else {
            console.log("Failed to capture frame.");
        }
    } else {
        console.log("No ioDevices available.");
    }

};

arduinoObjectDetection.prototype.disableVideo = function(args) {
   this.runtime.ioDevices.video.disableVideo();
};

module.exports = arduinoObjectDetection;
