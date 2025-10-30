// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");
const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");

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

    this.io.on("detection_result", (data) => {
      console.log(">>>> Received detection result:", data);
    //   bounding_box_xyxy: [73.84615384615385, 79.23076923076924, 297.69230769230774, 240]
    //   class_name: "person"
    //   confidence: "91.12"

      data.detection.forEach((detection) => {
        console.log(
          `Detected ${detection.class_name} with confidence ${detection.confidence} at [${detection.bounding_box_xyxy.join(", ")}]`,
        );
      });
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
        arguments: {},
      },
      {
        opcode: "disableVideo",
        blockType: BlockType.COMMAND,
        text: "disable video",
        func: "disableVideo",
        arguments: {},
      },
    ],
    menus: {
      // Define any menus for the extension here
      modelsLabels: [
        "airplane",
        "apple",
        "backpack", 
        "banana",
        "baseball bat",
        "baseball glove",
        "bear",
        "bed",
        "bench",
        "bicycle",
        "bird",
        "boat",
        "book",
        "bottle",
        "bowl",
        "broccoli",
        "bus",
        "cake",
        "car",
        "carrot",
        "cat",
        "cell phone",
        "chair",
        "clock",
        "couch",
        "cow",
        "cup",
        "dining table",
        "dog",
        "donut",
        "elephant",
        "fire hydrant",
        "fork",
        "frisbee",
        "giraffe",
        "hair drier",
        "handbag",
        "hot dog",
        "horse",
        "keyboard",
        "kite",
        "knife",
        "laptop",
        "microwave",
        "motorcycle",
        "mouse",
        "orange",
        "oven",
        "parking meter",
        "person",
        "pizza",
        "potted plant",
        "refrigerator",
        "remote",
        "sandwich",
        "scissors",
        "sheep",
        "sink",
        "skateboard",
        "skis",
        "snowboard",
        "spoon",
        "sports ball",
        "stop sign",
        "suitcase",
        "surfboard",
        "teddy bear",
        "tennis racket",
        "tie",
        "toaster",
        "toilet",
        "toothbrush",
        "traffic light",
        "train",
        "truck",
        "tv",
        "umbrella",
        "vase",
        "wine glass",
        "zebra"
      ]
    }
  };
};

arduinoObjectDetection.prototype.enableVideo = function(args) {
  this.runtime.ioDevices.video.enableVideo();

  if (this.runtime.ioDevices) {
    // Get frame as canvas for base64 conversion
    const canvas = this.runtime.ioDevices.video.getFrame({
      format: Video.FORMAT_CANVAS,
      dimensions: [480, 360], // the same as the stage resolution
    });

    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png"); // PNG format
      const base64Frame = dataUrl.split(",")[1];
      this.io.emit("detect_objects", { image: base64Frame });
      console.log(`Processed frame in base64`, base64Frame.substring(0, 100) + "...");
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
