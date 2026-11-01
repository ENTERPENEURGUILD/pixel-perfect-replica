<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

<!-- LOVABLE:BEGIN -->
## Architecture rules

- Image generation runs server-side: `/api/generate-image` and `/api/edit-image` (TanStack file routes under `src/routes/api/`) forward to the Lovable AI Gateway (`google/gemini-3-pro-image`, gemini-chat format, SSE streamed). Never call the gateway from browser code; the model allowlist lives in `src/lib/image-gateway.server.ts` (`IMAGE_MODEL_MAP`) — a model id must be in the map to reach the gateway.
- Generated images are stored in the private `generations` storage bucket (path `<userId>/<uuid>.png`); reads use short-lived signed URLs via `signedUrl()` in `src/lib/generation-client.ts`, never public URLs.
- Credits deduct after each successful save via the `spend_credits` RPC (SECURITY DEFINER, server-side cost from the catalog; never pass client-computed costs as the source of truth).
