// const formatMessage = require('../../../../../../scratch-editor/node_modules/format-message');
const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");
const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");
const Rectangle = require("../../../../../../scratch-editor/packages/scratch-render/src/Rectangle.js");

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
    this.detectedObjects = [];
    this.drawnBoxes = [];
    this.penColor = [255, 0, 0]; // Default red color

    this.runtime.on('PROJECT_LOADED', () => {
        // Renderer should be available now
        console.log("PROJECT_LOADED event received in Arduino Object Detection extension.");
        if (this.runtime.renderer) {
            console.log("Renderer is available in runtime.");
           // Create or get pen skin
        if (!this.penSkinId) {
            this.penSkinId = this.runtime.renderer.createPenSkin();
            // Create drawable to hold the pen skin
            this.penDrawableId = this.runtime.renderer.createDrawable('pen');
            this.runtime.renderer.updateDrawableSkinId(this.penDrawableId, this.penSkinId);
        }
        } else {
            console.log("Renderer is NOT available in runtime.");
        }
    });
    this.io = io(wsServerURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    this.io.on("detection_result", (data) => {
      console.log(">>>> Received detection result:", data);

      data.detection.forEach((detection) => {
        // Convert bounding box from canvas coordinates [0-480, 0-360] to centered coordinates [-240 to +240, -180 to +180]
        const [x1, y1, x2, y2] = detection.bounding_box_xyxy;

        // Convert to centered coordinate system
        const centeredX1 = x1 - 240;  // 0-480 -> -240 to +240
        const centeredY1 = -(y1 - 180);  // 0-360 -> -180 to +180
        const centeredX2 = x2 - 240;
        const centeredY2 = -(y2 - 180);

        const centeredBoundingBox = [centeredX1, centeredY1, centeredX2, centeredY2];

        console.log(
          `Detected ${detection.class_name} with confidence ${detection.confidence}`
        );
        console.log(`  Original coords: [${detection.bounding_box_xyxy.join(", ")}]`);
        console.log(`  Centered coords: [${centeredBoundingBox.join(", ")}]`);

       // Create Rectangle object from bounding box coordinates
        const rectangle = this.createRectangleFromBounds(centeredX1, centeredY1, centeredX2, centeredY2);

        // Set pen attributes (convert RGB 0-255 to 0-1 range)
        const penAttributes = {
            color4f: [
            this.penColor[0] / 255,
            this.penColor[1] / 255,
            this.penColor[2] / 255,
            1.0
            ],
            diameter: 3
        };

        // Draw the rectangle using our helper method
        this.drawRectangleWithPen(rectangle, penAttributes);

        // Store the converted coordinates back to the detection object
        detection.bounding_box_centered = centeredBoundingBox;
      });

      // Store detected objects for drawing
      this.detectedObjects = data.detection;
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
      {
        opcode: "drawBoundingBox",
        blockType: BlockType.COMMAND,
        text: "draw box at x1 [X1] y1 [Y1] x2 [X2] y2 [Y2]",
        func: "drawBoundingBox",
        arguments: {
          X1: {
            type: ArgumentType.NUMBER,
            defaultValue: -100
          },
          Y1: {
            type: ArgumentType.NUMBER,
            defaultValue: -100
          },
          X2: {
            type: ArgumentType.NUMBER,
            defaultValue: 100
          },
          Y2: {
            type: ArgumentType.NUMBER,
            defaultValue: 100
          }
        }
      },
      {
        opcode: "clearBoundingBoxes",
        blockType: BlockType.COMMAND,
        text: "clear all boxes",
        func: "clearBoundingBoxes",
        arguments: {}
      },
      {
        opcode: "drawDetectedObjects",
        blockType: BlockType.COMMAND,
        text: "draw boxes for detected objects",
        func: "drawDetectedObjects",
        arguments: {}
      },
      {
        opcode: "setPenColor",
        blockType: BlockType.COMMAND,
        text: "set box color to [COLOR]",
        func: "setPenColor",
        arguments: {
          COLOR: {
            type: ArgumentType.COLOR,
            defaultValue: "#ff0000"
          }
        }
      },
    ],
    menus: {
      // Define any menus for the extension here
      modelsLabels: ["person", "cellphone"]
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

arduinoObjectDetection.prototype.drawBoundingBox = function(args, util) {
  const x1 = parseFloat(args.X1);
  const y1 = parseFloat(args.Y1);
  const x2 = parseFloat(args.X2);
  const y2 = parseFloat(args.Y2);

  // Create Rectangle object from bounding box coordinates
  const rectangle = this.createRectangleFromBounds(x1, y1, x2, y2);

  // Set pen attributes (convert RGB 0-255 to 0-1 range)
  const penAttributes = {
    color4f: [
      this.penColor[0] / 255,
      this.penColor[1] / 255,
      this.penColor[2] / 255,
      1.0
    ],
    diameter: 3
  };

  // Draw the rectangle using our helper method
  this.drawRectangleWithPen(rectangle, penAttributes);

  console.log(`Drew bounding box from (${x1}, ${y1}) to (${x2}, ${y2}) using Rectangle class`);
};

arduinoObjectDetection.prototype.clearBoundingBoxes = function(args) {
  // Clear all pen drawings from the stage
};

arduinoObjectDetection.prototype.drawDetectedObjects = function(args) {
  // Clear existing boxes first
  this.clearBoundingBoxes();

  // Draw boxes for all detected objects
  this.detectedObjects.forEach(detection => {
    if (detection.bounding_box_centered) {
      const [x1, y1, x2, y2] = detection.bounding_box_centered;
      this.drawBoundingBox({
        X1: x1,
        Y1: y1,
        X2: x2,
        Y2: y2
      });
      console.log(`Drew box for ${detection.class_name} (confidence: ${detection.confidence})`);
    }
  });
};

arduinoObjectDetection.prototype.setPenColor = function(args) {
  // Convert hex color to RGB array
  const hexColor = args.COLOR;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  this.penColor = [r, g, b];
  console.log(`Set bounding box color to RGB(${r}, ${g}, ${b})`);
};

/**
 * Draw a rectangle using the Rectangle class and pen system
 * @param {Rectangle} rectangle - Rectangle object defining the bounds
 * @param {Object} penAttributes - Pen drawing attributes (color, thickness)
 */
arduinoObjectDetection.prototype.drawRectangleWithPen = function(rectangle, penAttributes) {
  if (!this.runtime.renderer || !this.penSkinId) {
    console.log("Renderer or pen skin not available");
    return;
  }

  // Get the pen skin object
  const penSkin = this.runtime.renderer._allSkins[this.penSkinId];
  if (!penSkin) {
    console.log("Pen skin not found");
    return;
  }

  // Extract rectangle coordinates
  const left = rectangle.left;
  const right = rectangle.right;
  const bottom = rectangle.bottom;
  const top = rectangle.top;

  console.log(`Drawing rectangle: left=${left}, right=${right}, bottom=${bottom}, top=${top}`);

  // Draw the 4 sides of the rectangle using the pen
  // Top line: (left, top) to (right, top)
  penSkin.drawLine(penAttributes, left, top, right, top);

  // Right line: (right, top) to (right, bottom)
  penSkin.drawLine(penAttributes, right, top, right, bottom);

  // Bottom line: (right, bottom) to (left, bottom)
  penSkin.drawLine(penAttributes, right, bottom, left, bottom);

  // Left line: (left, bottom) to (left, top)
  penSkin.drawLine(penAttributes, left, bottom, left, top);

  console.log("Rectangle drawn successfully with pen");
};

/**
 * Create a Rectangle from bounding box coordinates
 * @param {number} x1 - Left coordinate
 * @param {number} y1 - Top coordinate
 * @param {number} x2 - Right coordinate
 * @param {number} y2 - Bottom coordinate
 * @returns {Rectangle} Rectangle object
 */
arduinoObjectDetection.prototype.createRectangleFromBounds = function(x1, y1, x2, y2) {
  const rectangle = new Rectangle();
  // Rectangle.initFromBounds expects (left, right, bottom, top)
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const bottom = Math.min(y1, y2);
  const top = Math.max(y1, y2);

  rectangle.initFromBounds(left, right, bottom, top);
  return rectangle;
};

module.exports = arduinoObjectDetection;