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
  ZEBRA: "zebra",
};

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

  toString() {
    return `Detection: ${this.label} (${(this.confidence * 100).toFixed(1)}%) at [${this.rectangle.left.toFixed(1)}, ${
      this.rectangle.top.toFixed(1)
    }, ${this.rectangle.right.toFixed(1)}, ${this.rectangle.bottom.toFixed(1)}]`;
  }
}

export { Detection, MODEL_LABELS };
