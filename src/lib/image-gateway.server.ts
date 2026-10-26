// Server-only module: Lovable AI image generation helpers + request verification.
// Never import from client code. Keep LOVABLE_API_KEY server-side.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev";

/** UI model id -> gateway model id. Only Google image models are connected for now. */
export const IMAGE_MODEL_MAP: Record<string, string> = {
  "gemini-3-pro-image": "google/gemini-3-pro-image",
  "gemini-3.1-flash-image": "google/gemini-3.1-flash-image",
};

export type ImageConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  format: "openai" | "gemini-chat" | "generate-content" | "cloudflare-input";
};

export function generateImage(
  config: ImageConfig,
  prompt: string,
  stream = true,
  aspect?: string,
  signal?: AbortSignal,
) {
  const input: Record<string, unknown> =
    config.format === "gemini-chat"
      ? { messages: [{ role: "user", content: prompt }], modalities: ["image", "text"] }
      : { prompt };
  if (aspect) input["image_config"] = { aspect_ratio: aspect };
  return fetch(`${config.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: config.model, ...input, ...(stream ? { stream: true } : {}) }),
    signal: signal ?? null,
  });
}

export async function editImage(config: ImageConfig, form: FormData, signal?: AbortSignal) {
  const streaming = form.get("stream") !== "false";
  const prompt = form.get("prompt");
  const images = [...form.entries()]
    .filter(([name, value]) => name === "image" && value instanceof File)
    .map(([, value]) => value as File);
  if (typeof prompt !== "string" || !prompt.trim() || images.length === 0) {
    return new Response("An image and edit instruction are required", { status: 400 });
  }
  const encoded = await Promise.all(
    images.map(async (image) => {
      const bytes = new Uint8Array(await image.arrayBuffer());
      const data = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
      return { mimeType: image.type, url: `data:${image.type};base64,${data}` };
    }),
  );
  const input: Record<string, unknown> = {
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...encoded.map(({ url }) => ({ type: "image_url", image_url: { url } })),
        ],
      },
    ],
    modalities: ["image", "text"],
  };
  const aspect = form.get("aspect");
  if (typeof aspect === "string" && aspect) input["image_config"] = { aspect_ratio: aspect };
  return fetch(`${config.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: config.model, ...input, ...(streaming ? { stream: true } : {}) }),
    signal: signal ?? null,
  });
}

/** Verifies the caller's bearer token and returns the user id, or null. */
export async function verifyBearer(request: Request): Promise<string | null> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  if (!token || token.split(".").length !== 3) return null;
  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
}
