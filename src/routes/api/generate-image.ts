import { createFileRoute } from "@tanstack/react-router";
import { GATEWAY_BASE_URL, IMAGE_MODEL_MAP, generateImage, verifyBearer } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await verifyBearer(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const body = (await request.json().catch(() => null)) as {
          model?: string;
          prompt?: string;
          aspect?: string;
          stream?: boolean;
        } | null;
        if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
          return new Response("A prompt is required", { status: 400 });
        }
        const gatewayModel = IMAGE_MODEL_MAP[body.model ?? ""];
        if (!gatewayModel) return new Response("Unknown or unsupported model", { status: 400 });
        const aspect = typeof body.aspect === "string" && body.aspect !== "Auto" ? body.aspect : undefined;

        const upstream = await generateImage(
          { baseURL: GATEWAY_BASE_URL, apiKey, model: gatewayModel, format: "gemini-chat" },
          body.prompt.slice(0, 2000),
          body.stream !== false,
          aspect,
        );
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
