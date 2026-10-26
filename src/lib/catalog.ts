/**
 * Model catalogue + pricing configuration (DEVELOPMENT PRICING).
 * Single source of truth for model capabilities and credit costs in the UI.
 * The server allowlist in src/lib/image-gateway.server.ts decides which ids
 * actually reach the gateway; server must re-validate everything before
 * deducting credits.
 */

export type Quality = "low" | "medium" | "high";
export type Resolution = "1K" | "2K" | "4K";
export type ModelStatus = "available" | "not_connected" | "coming_soon";

export interface ImageModel {
  id: string;
  /** Exact model id on the Lovable AI Gateway, when the model is connected. */
  gatewayModel?: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  aspectRatios: string[];
  qualities: Quality[];
  resolutions: Resolution[];
  maxImages: number;
  supportsReference: boolean;
  /** Credits for one image at 1K, per quality. */
  baseCost: Partial<Record<Quality, number>>;
  status: ModelStatus;
}

export const RESOLUTION_MULTIPLIER: Record<Resolution, number> = {
  "1K": 1,
  "2K": 1.5,
  "4K": 2.5,
};

export const MODELS: ImageModel[] = [
  {
    id: "gemini-3-pro-image",
    gatewayModel: "google/gemini-3-pro-image",
    name: "Gemini 3 Pro Image",
    provider: "Google",
    description: "Google's flagship image model — sharp detail and strong text rendering.",
    capabilities: ["Text to image", "Image editing", "Text rendering"],
    aspectRatios: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"],
    qualities: ["medium"],
    resolutions: ["1K"],
    maxImages: 4,
    supportsReference: true,
    baseCost: { medium: 2 },
    status: "available",
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    provider: "OpenAI",
    description: "Strong prompt adherence and legible text in images.",
    capabilities: ["Text to image", "Image editing", "Text rendering"],
    aspectRatios: ["Auto", "1:1", "3:2", "2:3"],
    qualities: ["low", "medium", "high"],
    resolutions: ["1K", "2K"],
    maxImages: 4,
    supportsReference: true,
    baseCost: { low: 1, medium: 2, high: 4 },
    status: "not_connected",
  },
  {
    id: "flux-2-pro",
    name: "FLUX.2 Pro",
    provider: "Black Forest Labs",
    description: "Photoreal detail for product and cinematic scenes.",
    capabilities: ["Text to image", "Photorealism"],
    aspectRatios: ["1:1", "16:9", "9:16", "3:2", "2:3"],
    qualities: ["high"],
    resolutions: ["1K", "2K"],
    maxImages: 2,
    supportsReference: false,
    baseCost: { high: 3 },
    status: "coming_soon",
  },
];

export const QUALITY_LABEL: Record<Quality, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const STATUS_LABEL: Record<ModelStatus, string> = {
  available: "Available",
  not_connected: "Not connected",
  coming_soon: "Coming soon",
};

export function getModel(id: string): ImageModel {
  return (MODELS.find((m) => m.id === id) ?? MODELS[0])!;
}

export interface CostInput {
  modelId: string;
  quality: Quality;
  resolution: Resolution;
  count: number;
}

/** Estimated cost in credits. Returns null when the combination is unsupported. */
export function estimateCost({ modelId, quality, resolution, count }: CostInput): number | null {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return null;
  const base = model.baseCost[quality];
  if (base === undefined || !model.resolutions.includes(resolution)) return null;
  if (!Number.isInteger(count) || count < 1 || count > model.maxImages) return null;
  return Math.round(base * RESOLUTION_MULTIPLIER[resolution] * count * 10) / 10;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceInr: number;
  highlight?: boolean;
}

/** Illustrative packages — DEVELOPMENT DATA, no real payments are processed. */
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", name: "Starter", credits: 100, priceInr: 199 },
  { id: "creator", name: "Creator", credits: 500, priceInr: 899, highlight: true },
  { id: "studio", name: "Studio", credits: 1500, priceInr: 2399 },
];
