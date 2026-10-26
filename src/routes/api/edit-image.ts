import { createFileRoute } from "@tanstack/react-router";
import { GATEWAY_BASE_URL, IMAGE_MODEL_MAP, editImage, verifyBearer } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/edit-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await verifyBearer(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const form = await request.formData();
        const gatewayModel = IMAGE_MODEL_MAP[String(form.get("model") ?? "")];
        if (!gatewayModel) return new Response("Unknown or unsupported model", { status: 400 });

        const upstream = await editImage(
          { baseURL: GATEWAY_BASE_URL, apiKey, model: gatewayModel, format: "gemini-chat" },
          form,
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
