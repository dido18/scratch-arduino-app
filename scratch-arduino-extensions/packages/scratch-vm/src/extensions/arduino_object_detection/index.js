const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");
const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");
const Rectangle = require("../../../../../../scratch-editor/packages/scratch-render/src/Rectangle.js");
const StageLayering = require("../../../../../../scratch-editor/packages/scratch-vm/src/engine/stage-layering.js");
const { Detection, MODEL_LABELS } = require("./object_detection");

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

// const wsServerURL = `${window.location.protocol}//${window.location.hostname}:7000`;

const wsServerURL = `ws://192.168.1.39:7000`;

/**
 * RGB color constants for confidence visualization
 */
const RGB_COLORS = {
  RED: { r: 1.0, g: 0.0, b: 0.0 },
  ORANGE: { r: 1.0, g: 0.5, b: 0.0 },
  GREEN: { r: 0.0, g: 1.0, b: 0.0 },
};

class ArduinoObjectDetection {
  constructor(runtime) {
    this.runtime = runtime;

    /** @type {Array<Detection>} */
    this.detectedObjects = [];

    this._penSkinId = null;

    /** @type {Object<string, boolean>} */
    this._detectionStates = this._initializeDetectionStates();

    /** @type {number|null} */
    this._loopIntervalId = null;

    /** @type {boolean} */
    this._isLoopRunning = false;

    /** @type {boolean} */
    this._enableBoundingBoxes = true;

    this.runtime.on("PROJECT_LOADED", () => {
      if (!this.runtime.renderer) {
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

      this._clearBoundingBoxes();

      data.detection.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.bounding_box_xyxy;

        const detectionObject = new Detection(
          detection.class_name,
          this._createRectangleFromBoundingBox(x1, y1, x2, y2),
          parseFloat(detection.confidence),
        );
        this.detectedObjects.push(detectionObject);

        console.log(
          `Detected ${detectionObject.label} with confidence ${
            detectionObject.confidence.toFixed(2)
          } took ${data.processing_time}`,
        );
      });

      this._updateDetectionStates();

      if (this._enableBoundingBoxes) {
        this._drawBoundingBoxes();
      } else {
        this._clearBoundingBoxes();
      }
    });
  }
}

ArduinoObjectDetection.prototype.getInfo = function() {
  return {
    id: "ArduinoObjectDetection",
    name: "Arduino Object Detection",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: "whenObjectDetected",
        blockType: BlockType.HAT,
        text: "when [OBJECT] detected",
        func: "whenObjectDetected",
        arguments: {
          OBJECT: {
            type: ArgumentType.STRING,
            menu: "modelsLabels",
            defaultValue: MODEL_LABELS.PERSON,
          },
        },
      },
      {
        opcode: "startDetectionLoop",
        blockType: BlockType.COMMAND,
        text: "start detection",
        func: "startDetectionLoop",
        arguments: {},
      },
      {
        opcode: "stopDetectionLoop",
        blockType: BlockType.COMMAND,
        text: "stop detection",
        func: "stopDetectionLoop",
        arguments: {},
      },
      {
        opcode: "isObjectDetected",
        blockType: BlockType.BOOLEAN,
        text: "is [OBJECT] detected",
        func: "isObjectDetected",
        arguments: {
          OBJECT: {
            type: ArgumentType.STRING,
            menu: "modelsLabels",
            defaultValue: MODEL_LABELS.PERSON,
          },
        },
      },
      {
        opcode: "showBoundingBoxes",
        blockType: BlockType.COMMAND,
        text: "show bounding boxes",
        func: "showBoundingBoxes",
        arguments: {},
      },
      {
        opcode: "hideBoundingBoxes",
        blockType: BlockType.COMMAND,
        text: "hide bounding boxes",
        func: "hideBoundingBoxes",
        arguments: {},
      },
      {
        opcode: "getDetectedObjectsCount",
        blockType: BlockType.REPORTER,
        text: "number of detected objects",
        func: "getDetectedObjectsCount",
        arguments: {},
      },
      {
        opcode: "getDetectedLabelsAsString",
        blockType: BlockType.REPORTER,
        text: "detected object labels",
        func: "getDetectedLabelsAsString",
        arguments: {},
      },
    ],
    menus: {
      modelsLabels: Object.values(MODEL_LABELS).sort(),
    },
  };
};

ArduinoObjectDetection.prototype.startDetectionLoop = function(args) {
  if (this._isLoopRunning) {
    console.log("Detection loop is already running");
    return;
  }

  this._isLoopRunning = true;
  this.runtime.ioDevices.video.enableVideo();
  this._loop();

  this._loopIntervalId = setInterval(() => {
    this._loop();
  }, 1000); // 1000ms = 1s
};

ArduinoObjectDetection.prototype.stopDetectionLoop = function(args) {
  this.runtime.ioDevices.video.disableVideo();
  this.hideBoundingBoxes();

  if (!this._isLoopRunning) {
    console.log("Detection loop is not running");
    return;
  }

  console.log("Stopping detection loop");
  this._isLoopRunning = false;
  if (this._loopIntervalId) {
    clearInterval(this._loopIntervalId);
    this._loopIntervalId = null;
  }
};

ArduinoObjectDetection.prototype._loop = function() {
  if (!this._isLoopRunning) {
    return;
  }
  this._detectObjects();

  // Note: The detection states for all objects will be updated
  // automatically when the detection_result event is received
};

ArduinoObjectDetection.prototype.whenObjectDetected = function(args) {
  const objectLabel = args.OBJECT;
  return this.detectedObjects.some(detectionObject =>
    detectionObject.label === objectLabel
  );
};

ArduinoObjectDetection.prototype.isObjectDetected = function(args) {
  const objectLabel = args.OBJECT;
  return this.detectedObjects.some(detectionObject =>
    detectionObject.label === objectLabel
  );
};

ArduinoObjectDetection.prototype.hideBoundingBoxes = function(args) {
  this._enableBoundingBoxes = false;
  this._clearBoundingBoxes();
};

ArduinoObjectDetection.prototype.showBoundingBoxes = function(args) {
  this._enableBoundingBoxes = true;
  this._drawBoundingBoxes();
};

ArduinoObjectDetection.prototype._detectObjects = function(args) {
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

ArduinoObjectDetection.prototype._clearBoundingBoxes = function(args) {
  if (!this.runtime.renderer || !this._penSkinId) {
    console.log("Renderer or pen skin not available for clearing");
    return;
  }
  const penSkin = this.runtime.renderer._allSkins[this._penSkinId];
  if (penSkin && penSkin.clear) {
    penSkin.clear();
  } else {
    console.log("Could not clear pen skin");
  }
};

ArduinoObjectDetection.prototype._drawBoundingBoxes = function(args) {
  this.detectedObjects.forEach(detectionObject => {
    const { r, g, b } = this._getColorByConfidence(detectionObject.confidence);
    const penAttributes = {
      color4f: [r, g, b, 1.0],
      diameter: 3,
    };
    this._drawRectangleWithPen(detectionObject.rectangle, penAttributes);
  });
};

/**
 * Get pen color based on confidence level
 * @param {number} confidence - Confidence score (0 to 100)
 * @returns {Object} RGB color object {r, g, b} in 0-1 range
 */
ArduinoObjectDetection.prototype._getColorByConfidence = function(confidence) {
  if (confidence >= 90) {
    return RGB_COLORS.GREEN;
  }
  if (confidence >= 75 && confidence < 90) {
    return RGB_COLORS.ORANGE;
  }
  return RGB_COLORS.RED;
};

/**
 * Draw a rectangle using the Rectangle class and pen system
 * @param {Rectangle} rectangle - Rectangle object defining the bounds
 * @param {Object} penAttributes - Pen drawing attributes (color, thickness)
 */
ArduinoObjectDetection.prototype._drawRectangleWithPen = function(rectangle, penAttributes) {
  if (!this.runtime.renderer || !this._penSkinId) {
    console.log("Renderer or pen skin not available");
    return;
  }

  // TODO: Get the pen skin object in a better way
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

ArduinoObjectDetection.prototype._createRectangleFromBoundingBox = function(x1, y1, x2, y2) {
  x1 = x1 - 240; // 0-480 -> -240 to +240
  y1 = -(y1 - 180); // 0-360 -> -180 to +180
  x2 = x2 - 240;
  y2 = -(y2 - 180);

  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const bottom = Math.min(y1, y2);
  const top = Math.max(y1, y2);

  const rectangle = new Rectangle();
  rectangle.initFromBounds(left, right, bottom, top);
  return rectangle;
};

/**
 * Block function: Get the total number of detected objects
 * @returns {number} Number of currently detected objects
 */
ArduinoObjectDetection.prototype.getDetectedObjectsCount = function() {
  return this.detectedObjects.length;
};

/**
 * Block function: Get detected object types as a comma-separated string
 * @returns {string} Comma-separated list of detected object types
 */
ArduinoObjectDetection.prototype.getDetectedLabelsAsString = function() {
  const detectedLabels = this.getDetectedLabels();
  return detectedLabels.length > 0 ? detectedLabels.join(', ') : 'none';
};

/**
 * Initialize detection states for all model labels
 * @returns {Object<string, boolean>} Object with all labels set to false
 */
ArduinoObjectDetection.prototype._initializeDetectionStates = function() {
  const states = {};
  Object.values(MODEL_LABELS).forEach(label => {
    states[label] = false;
  });
  return states;
};

/**
 * Update detection states based on currently detected objects
 */
ArduinoObjectDetection.prototype._updateDetectionStates = function() {
  // Reset all states to false
  Object.keys(this._detectionStates).forEach(label => {
    this._detectionStates[label] = false;
  });

  // Set to true for currently detected objects
  this.detectedObjects.forEach(detectionObject => {
    this._detectionStates[detectionObject.label] = true;
  });

  // Log detection updates for debugging
  const detectedLabels = Object.keys(this._detectionStates).filter(label => this._detectionStates[label]);
  if (detectedLabels.length > 0) {
    console.log(`Currently detected: ${detectedLabels.join(', ')}`);
  }
};

/**
 * Get all currently detected object labels
 * @returns {Array<string>} Array of currently detected object labels
 */
ArduinoObjectDetection.prototype.getDetectedLabels = function() {
  return Object.keys(this._detectionStates).filter(label => this._detectionStates[label]);
};

/**
 * Get detection states for all labels
 * @returns {Object<string, boolean>} Object mapping labels to detection state
 */
ArduinoObjectDetection.prototype.getAllDetectionStates = function() {
  return { ...this._detectionStates }; // Return a copy to prevent external modification
};

module.exports = ArduinoObjectDetection;
