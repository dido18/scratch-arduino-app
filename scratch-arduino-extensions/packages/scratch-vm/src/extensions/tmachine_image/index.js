const BlockType = require("../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/block-type");
const ArgumentType = require(
  "../../../../../../scratch-editor/packages/scratch-vm/src/extension-support/argument-type",
);

const Video = require("../../../../../../scratch-editor/packages/scratch-vm/src/io/video");

// TODO add icons
const iconURI = "";
const menuIconURI = "";

class TeachableMachineImage {
  constructor(runtime) {
    this.runtime = runtime;

    this.modelLabels = [];
    this.model = null;
    this.predictions = [];
    this.isModelLoaded = false;
    this.modelURL = "https://192.168.1.39:7000/my-model/";

    this.fetchModelLabels();
    this.loadModel();
  }

  async fetchModelLabels() {
    try {
      const response = await fetch(this.modelURL + "/metadata.json");
      const metadata = await response.json();
      this.modelLabels = metadata.labels || [];
      console.log("Fetched model labels:", this.modelLabels);
    } catch (error) {
      console.error("Error fetching model labels:", error);
      this.modelLabels = []; // fallback
    }
  }

  async loadModel() {
    try {
      // Load TensorFlow.js and Teachable Machine library
      if (!window.tf) {
        await this.loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js");
      }
      if (!window.tmImage) {
        await this.loadScript(
          "https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js",
        );
      }

      const modelURL = this.modelURL + "model.json";
      const metadataURL = this.modelURL + "metadata.json";

      this.model = await tmImage.load(modelURL, metadataURL);
      this.isModelLoaded = true;
      console.log("Teachable Machine model loaded successfully");
    } catch (error) {
      console.error("Error loading Teachable Machine model:", error);
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  startPredictionLoop() {
    if (!this.isModelLoaded) {
      console.log("Model not loaded");
      return;
    }

    const predict = async () => {
      try {
        const canvas = this.runtime.ioDevices.video.getFrame({
          format: Video.FORMAT_CANVAS,
          dimensions: [480, 360], // the same as the stage resolution
        });
        if (!canvas) {
          console.log("No canvas available from video frame.");
          return;
        }
        const prediction = await this.model.predict(canvas);
        console.log("preditions", prediction);
        this.predictions = prediction;
      } catch (error) {
        console.error("Prediction error:", error);
      }

      // Continue loop
      setTimeout(predict, 100); // Predict every 100ms
    };

    predict();
  }

  getConfidence(className) {
    if (!this.predictions) return 0;
    const prediction = this.predictions.find(p => p.className === className);
    return prediction ? prediction.probability : 0;
  }
}

TeachableMachineImage.prototype.getInfo = function() {
  return {
    id: "TeachableMachineImage",
    name: "Teachable Machine Image",
    menuIconURI: menuIconURI,
    blockIconURI: iconURI,
    blocks: [
      {
        opcode: "startDetectionLoop",
        blockType: BlockType.COMMAND,
        text: "start detection",
        func: "startDetectionLoop",
        arguments: {},
      },
      {
        opcode: "whenObjectDetected",
        blockType: BlockType.HAT,
        text: "when [OBJECT] detected with confidence > [THRESHOLD]%",
        func: "whenObjectDetected",
        arguments: {
          OBJECT: {
            type: ArgumentType.STRING,
            menu: "modelLabels",
            defaultValue: "ok",
          },
          THRESHOLD: {
            type: ArgumentType.NUMBER,
            defaultValue: 50,
          },
        },
      },
      {
        opcode: "isObjectDetected",
        blockType: BlockType.BOOLEAN,
        text: "is [OBJECT] detected with confidence > [THRESHOLD]%",
        func: "isObjectDetected",
        arguments: {
          OBJECT: {
            type: ArgumentType.STRING,
            menu: "modelLabels",
            defaultValue: "ok",
          },
          THRESHOLD: {
            type: ArgumentType.NUMBER,
            defaultValue: 50,
          },
        },
      },
      {
        opcode: "getConfidence",
        blockType: BlockType.REPORTER,
        text: "confidence of [OBJECT]",
        func: "getConfidence",
        arguments: {
          OBJECT: {
            type: ArgumentType.STRING,
            menu: "modelLabels",
            defaultValue: "ok",
          },
        },
      },
    ],
    menus: {
      modelLabels: "getModelLabels",
    },
  };
};

TeachableMachineImage.prototype.getModelLabels = function() {
  return this.modelLabels.length > 0 ? this.modelLabels : ["ok", "stop", "unknown"];
};

TeachableMachineImage.prototype.whenObjectDetected = function(args) {
  const confidence = this.getConfidence(args.OBJECT);
  return confidence > (args.THRESHOLD / 100);
};

TeachableMachineImage.prototype.isObjectDetected = function(args) {
  const confidence = this.getConfidence(args.OBJECT);
  return confidence > (args.THRESHOLD / 100);
};

TeachableMachineImage.prototype.getConfidence = function(args) {
  if (!this.predictions || this.predictions.length === 0) return 0;

  const prediction = this.predictions.find(p => p.className === args.OBJECT);
  const confidence = prediction ? Math.round(prediction.probability * 100) : 0;

  console.log("get confidence for", args.OBJECT, "=", confidence + "%");
  return confidence;
};

TeachableMachineImage.prototype.startDetectionLoop = function(args) {
  this.runtime.ioDevices.video.enableVideo();
  this.startPredictionLoop();
};

module.exports = TeachableMachineImage;
