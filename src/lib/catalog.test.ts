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
    expect(estimateCost({ modelId: "gemini-3-pro-image", quality: "high", resolution: "1K", count: 1 })).toBeNull();
  });

  it("charges the connected Google flagship 2 credits per medium 1K image", () => {
    expect(estimateCost({ modelId: "gemini-3-pro-image", quality: "medium", resolution: "1K", count: 1 })).toBe(2);
    expect(MODELS[0]!.id).toBe("gemini-3-pro-image");
    expect(MODELS[0]!.gatewayModel).toBe("google/gemini-3-pro-image");
    expect(MODELS[0]!.status).toBe("available");
  });

  it("rejects image counts above the model maximum", () => {
    expect(estimateCost({ modelId: "flux-2-pro", quality: "high", resolution: "1K", count: 3 })).toBeNull();
  });
});
