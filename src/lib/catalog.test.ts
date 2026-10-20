import { describe, expect, it } from "vitest";
import { estimateCost } from "./catalog";

describe("estimateCost", () => {
  it("scales base cost by resolution and count", () => {
    expect(estimateCost({ modelId: "gpt-image-2", quality: "high", resolution: "2K", count: 1 })).toBe(6);
    expect(estimateCost({ modelId: "gpt-image-2", quality: "low", resolution: "1K", count: 3 })).toBe(3);
  });

  it("rejects resolutions a model does not support", () => {
    expect(estimateCost({ modelId: "gpt-image-2", quality: "high", resolution: "4K", count: 1 })).toBeNull();
  });

  it("rejects qualities a model does not support", () => {
    expect(estimateCost({ modelId: "nano-banana-2", quality: "high", resolution: "1K", count: 1 })).toBeNull();
  });

  it("rejects image counts above the model maximum", () => {
    expect(estimateCost({ modelId: "flux-2-pro", quality: "high", resolution: "1K", count: 3 })).toBeNull();
  });
});
