const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);
const io = require("../socket.io.min.js");
const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");
const Rectangle = require("../../../../../../scratch-editor/packages/scratch-render/src/Rectangle.js");
const StageLayering = require("../../../../../../scratch-editor/packages/scratch-vm/src/engine/stage-layering.js");

/**
 * Model labels constants for object detection
 */
const MODEL_LABELS = {
  AIRPLANE: "airplane",
  APPLE: "apple",
  BACKPACK: "backpack",
  BANANA: "banana",
  BASEBALL_BAT: "baseball bat",
  BASEBALL_GLOVE: "baseball glove",
  BEAR: "bear",
  BED: "bed",
  BENCH: "bench",
  BICYCLE: "bicycle",
  BIRD: "bird",
  BOAT: "boat",
  BOOK: "book",
  BOTTLE: "bottle",
  BOWL: "bowl",
  BROCCOLI: "broccoli",
  BUS: "bus",
  CAKE: "cake",
  CAR: "car",
  CARROT: "carrot",
  CAT: "cat",
  CELL_PHONE: "cell phone",
  CHAIR: "chair",
  CLOCK: "clock",
  COUCH: "couch",
  COW: "cow",
  CUP: "cup",
  DINING_TABLE: "dining table",
  DOG: "dog",
  DONUT: "donut",
  ELEPHANT: "elephant",
  FIRE_HYDRANT: "fire hydrant",
  FORK: "fork",
  FRISBEE: "frisbee",
  GIRAFFE: "giraffe",
  HAIR_DRIER: "hair drier",
  HANDBAG: "handbag",
  HOT_DOG: "hot dog",
  HORSE: "horse",
  KEYBOARD: "keyboard",
  KITE: "kite",
  KNIFE: "knife",
  LAPTOP: "laptop",
  MICROWAVE: "microwave",
  MOTORCYCLE: "motorcycle",
  MOUSE: "mouse",
  ORANGE: "orange",
  OVEN: "oven",
  PARKING_METER: "parking meter",
  PERSON: "person",
  PIZZA: "pizza",
  POTTED_PLANT: "potted plant",
  REFRIGERATOR: "refrigerator",
  REMOTE: "remote",
  SANDWICH: "sandwich",
  SCISSORS: "scissors",
  SHEEP: "sheep",
  SINK: "sink",
  SKATEBOARD: "skateboard",
  SKIS: "skis",
  SNOWBOARD: "snowboard",
  SPOON: "spoon",
  SPORTS_BALL: "sports ball",
  STOP_SIGN: "stop sign",
  SUITCASE: "suitcase",
  SURFBOARD: "surfboard",
  TEDDY_BEAR: "teddy bear",
  TENNIS_RACKET: "tennis racket",
  TIE: "tie",
  TOASTER: "toaster",
  TOILET: "toilet",
  TOOTHBRUSH: "toothbrush",
  TRAFFIC_LIGHT: "traffic light",
  TRAIN: "train",
  TRUCK: "truck",
  TV: "tv",
  UMBRELLA: "umbrella",
  VASE: "vase",
  WINE_GLASS: "wine glass",
  ZEBRA: "zebra"
};

/**
 * Array of all available model labels for the menu
 * Dynamically generated from MODEL_LABELS object values
 */
const ALL_MODEL_LABELS = Object.values(MODEL_LABELS).sort();

/**
 * Detection Object class that represents a detected object with its properties
 */
class Detection {
  /**
   * Create a Detection object
   * @param {string} label - The object class name (e.g., "person", "car")
   * @param {Rectangle} rectangle - The bounding box as a Rectangle object
   * @param {number} confidence - The confidence score (0.0 to 1.0)
   */
  constructor(label, rectangle, confidence) {
    /** @type {string} */
    this.label = label;

    /** @type {Rectangle} */
    this.rectangle = rectangle;

    /** @type {number} */
    this.confidence = confidence;
  }

  /**
   * Get the bounding box coordinates
   * @returns {Object} Object with left, right, top, bottom properties
   */
  getBounds() {
    return {
      left: this.rectangle.left,
      right: this.rectangle.right,
      top: this.rectangle.top,
      bottom: this.rectangle.bottom,
    };
  }

  /**
   * Get the width of the bounding box
   * @returns {number} Width in pixels
   */
  getWidth() {
    return this.rectangle.right - this.rectangle.left;
  }

  /**
   * Get the height of the bounding box
   * @returns {number} Height in pixels
   */
  getHeight() {
    return this.rectangle.top - this.rectangle.bottom;
  }

  /**
   * Get the center point of the bounding box
   * @returns {Object} Object with x, y properties
   */
  getCenter() {
    return {
      x: (this.rectangle.left + this.rectangle.right) / 2,
      y: (this.rectangle.bottom + this.rectangle.top) / 2,
    };
  }

  /**
   * Get the area of the bounding box
   * @returns {number} Area in square pixels
   */
  getArea() {
    return this.getWidth() * this.getHeight();
  }

  /**
   * Get a string representation of the detection
   * @returns {string} Formatted string with detection info
   */
  toString() {
    return `Detection: ${this.label} (${(this.confidence * 100).toFixed(1)}%) at [${this.rectangle.left.toFixed(1)}, ${
      this.rectangle.top.toFixed(1)
    }, ${this.rectangle.right.toFixed(1)}, ${this.rectangle.bottom.toFixed(1)}]`;
  }
}

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

    /** @type {Array<Detection>} */
    this.detectedObjects = [];

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

      data.detection.forEach((detection) => {
        // Convert bounding box from canvas coordinates [0-480, 0-360] to centered coordinates [-240 to +240, -180 to +180]
        const [x1, y1, x2, y2] = detection.bounding_box_xyxy;

        // Convert to centered coordinate system
        const centeredX1 = x1 - 240; // 0-480 -> -240 to +240
        const centeredY1 = -(y1 - 180); // 0-360 -> -180 to +180
        const centeredX2 = x2 - 240;
        const centeredY2 = -(y2 - 180);

        const rectangle = this.createRectangleFromBounds(centeredX1, centeredY1, centeredX2, centeredY2);
        const detectionObject = new Detection(
          detection.class_name,
          rectangle,
          parseFloat(detection.confidence),
        );
        this.detectedObjects.push(detectionObject);

        console.log(
          `Detected ${detectionObject.label} with confidence ${detectionObject.confidence.toFixed(2)}`,
        );
      });

      this.showBoundingBoxes();
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
        opcode: "detectObjects",
        blockType: BlockType.COMMAND,
        text: "detect",
        func: "detectObjects",
        arguments: {},
      },
      {
        opcode: "showBoundingBoxes",
        blockType: BlockType.COMMAND,
        text: "show detected objects",
        func: "showBoundingBoxes",
        arguments: {
          STATE: {
            type: ArgumentType.BOOLEAN,
            defaultValue: true,
          },
        },
      },
      {
        opcode: "clearBoundingBoxes",
        blockType: BlockType.COMMAND,
        text: "clear detected objects",
        func: "clearBoundingBoxes",
        arguments: {
          STATE: {
            type: ArgumentType.BOOLEAN,
            defaultValue: true,
          },
        },
      },
    ],
    menus: {
      modelsLabels: ALL_MODEL_LABELS,
    },
  };
};

arduinoObjectDetection.prototype.whenObjectDetected = function(args) {
  if (!this.detectedObjects || this.detectedObjects.length === 0) {
    return false;
  }
  const labelToDetect = args.OBJECT;
  const matchingDetections = this.getDetectionsByLabel(labelToDetect);
  return matchingDetections.length > 0;
};

arduinoObjectDetection.prototype.enableVideo = function(args) {
  this.runtime.ioDevices.video.enableVideo();
};

arduinoObjectDetection.prototype.detectObjects = function(args) {
  if (!this.runtime.ioDevices) {
    console.log("No ioDevices available.");
    return;
  }
  this.clearBoundingBoxes();
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

arduinoObjectDetection.prototype.showBoundingBoxes = function(args) {
  if (!this.detectedObjects || this.detectedObjects.length === 0) {
    console.log("No detected objects to show");
    return;
  }

  this.clearBoundingBoxes();

  this.detectedObjects.forEach(detectionObject => {
    const { r, g, b } = this.getColorByConfidence(detectionObject.confidence);
    const penAttributes = {
      color4f: [r, g, b, 1.0],
      diameter: 3,
    };
    this._drawRectangleWithPen(detectionObject.rectangle, penAttributes);
  });
};

arduinoObjectDetection.prototype.clearBoundingBoxes = function(args) {
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


/**
 * Get pen color based on confidence level
 * @param {number} confidence - Confidence score (0 to 100)
 * @returns {Object} RGB color object {r, g, b} in 0-1 range
 */
arduinoObjectDetection.prototype.getColorByConfidence = function(confidence) {
  // Define confidence thresholds and corresponding colors
  if (confidence >= 90) {
    // High confidence: Bright Green
    return { r: 0.0, g: 1.0, b: 0.0 };
  } else if (confidence >= 60) {
    // Medium-high confidence: Yellow-Green
    return { r: 0.5, g: 1.0, b: 0.0 };
  } else if (confidence >= 40) {
    // Medium confidence: Yellow
    return { r: 1.0, g: 1.0, b: 0.0 };
  } else if (confidence >= 20) {
    // Low-medium confidence: Orange
    return { r: 1.0, g: 0.5, b: 0.0 };
  } else {
    // Low confidence: Red
    return { r: 1.0, g: 0.0, b: 0.0 };
  }
};



/**
 * Draw a rectangle using the Rectangle class and pen system
 * @param {Rectangle} rectangle - Rectangle object defining the bounds
 * @param {Object} penAttributes - Pen drawing attributes (color, thickness)
 */
arduinoObjectDetection.prototype._drawRectangleWithPen = function(rectangle, penAttributes) {
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
 * Get detections by label
 * @param {string} label - Object label to filter by
 * @returns {Array<Detection>} Array of Detection objects matching the label
 */
arduinoObjectDetection.prototype.getDetectionsByLabel = function(label) {
  return this.detectedObjects.filter(detection => detection.label === label);
};

module.exports = arduinoObjectDetection;
