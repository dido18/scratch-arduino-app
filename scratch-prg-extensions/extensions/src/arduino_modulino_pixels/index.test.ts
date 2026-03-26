import { describe, it, expect } from "vitest";
import ModulinoPixels from "./index";

describe("ModulinoPixels", () => {
  it("should initialize the extension", () => {
    const extension = new ModulinoPixels();
    expect(extension).toBeDefined();
  });
});
