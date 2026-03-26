import {
  type BlockUtilityWithID,
  type Environment,
  extension,
  type ExtensionMenuDisplayDetails,
  scratch,
} from "$common";
import { io, type Socket } from "socket.io-client";

// Get Arduino board IP or hostname from URL parameter
const getArduinoBoardHost = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const boardHost = urlParams.get("host");
  if (boardHost) {
    return boardHost;
  }
  return window.location.hostname;
};

export default class ModulinoPixels extends extension({
  name: "Pixels",
  description: "Control Arduino Modulino RGB pixel LEDs",
  iconURL: "modulinos.png",
  insetIconURL: "modulino-buttons.svg",
  tags: ["Arduino", "Modulino"],
  blockColor: "#00878F",
  menuColor: "#8C7965",
  menuSelectColor: "#62AEB2",
}, "ui") {
//   private socket: Socket | null = null;

  init(env: Environment) {
    const arduinoBoardHost = getArduinoBoardHost();
    var serverURL = `wss://${arduinoBoardHost}:7000`;

    this.socket = io(serverURL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log(`Connected to Arduino UNO Q`, serverURL);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Disconnected from Arduino UNO Q: ${reason}`);
    });
  }

  @scratch.command(function(_, tag) {
    return tag`Set all pixels to R: ${"RED"} G: ${"GREEN"} B: ${"BLUE"}"`;
  })
  setAllPixelsRGB(
    red: number,
    green: number,
    blue: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.emit("pixels_set_all_rgb", {
          r: Math.min(255, Math.max(0, red)),
          g: Math.min(255, Math.max(0, green)),
          b: Math.min(255, Math.max(0, blue)),
        }, () => resolve());
      } else {
        resolve();
      }
    });
  }

//   @scratch.command(function(instance, tag) {
//     return tag`Set pixel ${"PIXEL"} to R: ${"RED"} G: ${"GREEN"} B: ${"BLUE"}"`;
//   })
//   setPixelRGB(
//     pixel: number,
//     red: number,
//     green: number,
//     blue: number,
//     util: BlockUtilityWithID
//   ): Promise<void> {
//     return new Promise((resolve) => {
//       if (this.socket) {
//         this.socket.emit("pixels_set_rgb", {
//           pixel: Math.max(0, pixel),
//           r: Math.min(255, Math.max(0, red)),
//           g: Math.min(255, Math.max(0, green)),
//           b: Math.min(255, Math.max(0, blue)),
//         }, () => resolve());
//       } else {
//         resolve();
//       }
//     });
//   }

//   @scratch.command(function(instance, tag) {
//     return tag`Clear all pixels`;
//   })
//   clearAllPixels(util: BlockUtilityWithID): Promise<void> {
//     return new Promise((resolve) => {
//       if (this.socket) {
//         this.socket.emit("pixels_clear_all", {}, () => resolve());
//       } else {
//         resolve();
//       }
//     });
//   }

//   @scratch.command(function(instance, tag) {
//     return tag`Clear pixel ${"PIXEL"}`;
//   })
//   clearPixel(pixel: number, util: BlockUtilityWithID): Promise<void> {
//     return new Promise((resolve) => {
//       if (this.socket) {
//         this.socket.emit("pixels_clear", {
//           pixel: Math.max(0, pixel),
//         }, () => resolve());
//       } else {
//         resolve();
//       }
//     });
//   }
}
