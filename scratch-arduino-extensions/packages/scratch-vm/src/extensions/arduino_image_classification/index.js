const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");
const ArduinoUnoQ = require("../ArduinoUnoQ");

// TODO add icons
const iconURI = "";
const menuIconURI = "";


class ArduinoImageClassification {
  constructor(runtime) {
    this.runtime = runtime;

    this.unoq = new ArduinoUnoQ();
    this.unoq.connect();

    this.runtime.on("PROJECT_LOADED", () => {
      if (!this.runtime.renderer) {
        console.log("Renderer is NOT available in runtime.");
        return;
      }
    });

    this.unoq.on("classification_result", (data) => {
        console.log(
          `Classified ${data.results} with confidence took ${data.processing_time}`,
        );
    });
  }
}

ArduinoImageClassification.prototype.getInfo = function() {
  return {
    id: "ArduinoImageClassification",
    name: "Arduino Image Classification",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: "classifyImage",
        blockType: BlockType.COMMAND,
        text: "classify image",
        func: "classifyImage",
        arguments: {},
      },
    ],
  };
};

ArduinoImageClassification.prototype.classifyImage = function(args) {
  if (!this.runtime.ioDevices) {
    console.log("No ioDevices available.");
    return;
  }
this.runtime.ioDevices.video.enableVideo();

  const canvas = this.runtime.ioDevices.video.getFrame({
    format: Video.FORMAT_CANVAS,
    dimensions: [480, 360], // the same as the stage resolution
  });
  if (canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    const base64Frame = dataUrl.split(",")[1];
    this.unoq.classifyImage(base64Frame);
  } else {
    console.log("No video frame available for classification.");
  }
}


module.exports = ArduinoImageClassification;
