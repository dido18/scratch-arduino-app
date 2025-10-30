const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");
const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");
const Rectangle = require("../../../../../../scratch-editor/packages/scratch-render/src/Rectangle.js");
const StageLayering = require("../../../../../../scratch-editor/packages/scratch-vm/src/engine/stage-layering.js");

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
    this.penColor = [255, 0, 0]; // Default red color
    this.boundingBoxesVisible = true;

    this.runtime.on('PROJECT_LOADED', () => {
        if (!this.runtime.renderer){
            console.log("Renderer is NOT available in runtime.");
            return;
        }
        if (!this._penSkinId) {
            this._penSkinId = this.runtime.renderer.createPenSkin();
            this.penDrawableId = this.runtime.renderer.createDrawable(StageLayering.PEN_LAYER);
            this.runtime.renderer.updateDrawableSkinId(this.penDrawableId, this._penSkinId);
        }
    });
    this.io = io(wsServerURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    this.io.on("detection_result", (data) => {
      this.detectedObjects = [];

      data.detection.forEach((detection) => {
        // Convert bounding box from canvas coordinates [0-480, 0-360] to centered coordinates [-240 to +240, -180 to +180]
        const [x1, y1, x2, y2] = detection.bounding_box_xyxy;

        // Convert to centered coordinate system
        const centeredX1 = x1 - 240;  // 0-480 -> -240 to +240
        const centeredY1 = -(y1 - 180);  // 0-360 -> -180 to +180
        const centeredX2 = x2 - 240;
        const centeredY2 = -(y2 - 180);

        const rectangle = this.createRectangleFromBounds(centeredX1, centeredY1, centeredX2, centeredY2);
        const detectionObject = {
          label: detection.class_name,           // String: object class name
          rectangle: rectangle,                  // Rectangle: bounding box as Rectangle object
          confidence: parseFloat(detection.confidence)  // Number: confidence score
        };
        this.detectedObjects.push(detectionObject);

        console.log(
          `Detected ${detectionObject.label} with confidence ${detectionObject.confidence.toFixed(2)}`
        );
      });

      if (this.boundingBoxesVisible) {
        this.showDetectedObjects();
      }
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
        opcode: "detectObjects",
        blockType: BlockType.COMMAND,
        text: "detect",
        func: "detectObjects",
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
        opcode: "toggleBoundingBoxes",
        blockType: BlockType.COMMAND,
        text: "set bounding boxes [SHOW]",
        func: "toggleBoundingBoxes",
        arguments: {
          SHOW: {
            type: ArgumentType.STRING,
            menu: "showHideMenu",
            defaultValue: "show"
          }
        }
      },
    ],
    menus: {
      modelsLabels: ["person", "cellphone"],
      showHideMenu: [
        {
          text: "show",
          value: "show"
        },
        {
          text: "hide",
          value: "hide"
        }
      ]
    }
  };
};

arduinoObjectDetection.prototype.enableVideo = function(args) {
  this.runtime.ioDevices.video.enableVideo();
};

arduinoObjectDetection.prototype.detectObjects = function(args) {
  if (!this.runtime.ioDevices) {
    console.log("No ioDevices available.");
    return;
  }
    const canvas = this.runtime.ioDevices.video.getFrame({
      format: Video.FORMAT_CANVAS,
      dimensions: [480, 360], // the same as the stage resolution
    });
    if (!canvas) {
        console.log("No canvas available from video frame.");
        return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    const base64Frame = dataUrl.split(",")[1];
    this.io.emit("detect_objects", { image: base64Frame });
};

arduinoObjectDetection.prototype.disableVideo = function(args) {
  this.runtime.ioDevices.video.disableVideo();
};

arduinoObjectDetection.prototype.toggleBoundingBoxes = function(args) {
  const showValue = args.SHOW;
  const shouldShow = showValue === "show";

  if (shouldShow) {
    this.boundingBoxesVisible = true;
    this.showDetectedObjects();
  } else {
    this.boundingBoxesVisible = false;
    this.clearAllBoundingBoxes();
  }
};

arduinoObjectDetection.prototype.showDetectedObjects = function() {
  if (!this.detectedObjects || this.detectedObjects.length === 0) {
    console.log("No detected objects to show");
    return;
  }

  this.clearAllBoundingBoxes();

  this.detectedObjects.forEach(detectionObject => {
    const rectangle = detectionObject.rectangle;
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

    this.drawRectangleWithPen(rectangle, penAttributes);
    console.log(`Showed box for ${detectionObject.label} (confidence: ${detectionObject.confidence.toFixed(2)})`);
  });
};

/**
 * Clear all bounding boxes from the display
 */
arduinoObjectDetection.prototype.clearAllBoundingBoxes = function() {
  if (!this.runtime.renderer || !this._penSkinId) {
    console.log("Renderer or pen skin not available for clearing");
    return;
  }
  // TODO: Get the pen skin object and clear it
  const penSkin = this.runtime.renderer._allSkins[this._penSkinId];
  if (penSkin && penSkin.clear) {
    penSkin.clear();
  } else {
    console.log("Could not clear pen skin");
  }
};

/**
 * Draw a rectangle using the Rectangle class and pen system
 * @param {Rectangle} rectangle - Rectangle object defining the bounds
 * @param {Object} penAttributes - Pen drawing attributes (color, thickness)
 */
arduinoObjectDetection.prototype.drawRectangleWithPen = function(rectangle, penAttributes) {
  if (!this.runtime.renderer || !this._penSkinId) {
    console.log("Renderer or pen skin not available");
    return;
  }

  // Get the pen skin object
  const penSkin = this.runtime.renderer._allSkins[this._penSkinId];
  if (!penSkin) {
    console.log("Pen skin not found");
    return;
  }

  const left = rectangle.left;
  const right = rectangle.right;
  const bottom = rectangle.bottom;
  const top = rectangle.top;

  penSkin.drawLine(penAttributes, left, top, right, top);
  penSkin.drawLine(penAttributes, right, top, right, bottom);
  penSkin.drawLine(penAttributes, right, bottom, left, bottom);
  penSkin.drawLine(penAttributes, left, bottom, left, top);
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

/**
 * Get all detection objects
 * @returns {Array} Array of detection objects with {label, rectangle, confidence}
 */
arduinoObjectDetection.prototype.getDetections = function() {
  return this.detectedObjects;
};

/**
 * Get detection count
 * @returns {number} Number of detected objects
 */
arduinoObjectDetection.prototype.getDetectionCount = function() {
  return this.detectedObjects.length;
};

/**
 * Get detections by label
 * @param {string} label - Object label to filter by
 * @returns {Array} Array of detection objects matching the label
 */
arduinoObjectDetection.prototype.getDetectionsByLabel = function(label) {
  return this.detectedObjects.filter(detection => detection.label === label);
};

/**
 * Get detection labels
 * @returns {Array} Array of unique labels from current detections
 */
arduinoObjectDetection.prototype.getDetectionLabels = function() {
  const labels = this.detectedObjects.map(detection => detection.label);
  return [...new Set(labels)]; // Remove duplicates
};

module.exports = arduinoObjectDetection;