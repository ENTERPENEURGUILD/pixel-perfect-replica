import { estimateCost, getModel } from "@/lib/catalog";
import { streamImage } from "@/lib/stream-image";
import { supabase } from "@/integrations/supabase/client";

export interface RunGenerationOptions {
  modelId: string;
  prompt: string;
  aspect: string;
  count: number;
  reference: File | null;
  onFrame: (index: number, dataUrl: string, isFinal: boolean) => void;
  /** Called with the storage path once the image is saved to the library. */
  onSaved: (index: number, path: string) => void;
}

/**
 * Signs a read URL for a file in the private "generations" bucket.
 * Signed URLs stay valid for 7 days; refetch when one expires.
 */
export async function signedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("generations").createSignedUrl(path, 604800);
  return data?.signedUrl ?? null;
}

async function saveGeneration(
  userId: string,
  opts: RunGenerationOptions,
  dataUrl: string,
): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/${crypto.randomUUID()}.png`;
  const { error: uploadError } = await supabase.storage
    .from("generations")
    .upload(path, blob, { contentType: "image/png" });
  if (uploadError) throw new Error(`Couldn't save to your library: ${uploadError.message}`);
  const { error: insertError } = await supabase.from("generations").insert({
    user_id: userId,
    prompt: opts.prompt,
    model_id: opts.modelId,
    aspect: opts.aspect,
    image_url: path,
  });
  if (insertError) throw new Error(`Couldn't save to your library: ${insertError.message}`);
  return path;
}

/**
 * Generates `count` images sequentially against /api/generate-image (or
 * /api/edit-image when a reference photo is attached), saves each one to the
 * user's library, and deducts its credit cost server-side via RPC.
 */
export async function runGeneration(opts: RunGenerationOptions): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  const token = session?.access_token;
  if (!session || !token) throw new Error("Your session expired — sign in again.");
  const userId = session.user.id;
  const headers = { Authorization: `Bearer ${token}` };

  const model = getModel(opts.modelId);
  const perImageCost =
    estimateCost({
      modelId: opts.modelId,
      quality: model.qualities[0]!,
      resolution: model.resolutions[0]!,
      count: 1,
    }) ?? 0;

  for (let i = 0; i < opts.count; i++) {
    const index = i;
    let lastDataUrl = "";
    const onFrame = (dataUrl: string, isFinal: boolean) => {
      if (dataUrl) lastDataUrl = dataUrl;
      opts.onFrame(index, dataUrl, isFinal);
    };

    if (opts.reference) {
      const form = new FormData();
      form.set("model", opts.modelId);
      form.set("prompt", opts.prompt);
      form.set("aspect", opts.aspect);
      form.set("image", opts.reference);
      await streamImage("/api/edit-image", form, onFrame, undefined, headers);
    } else {
      await streamImage(
        "/api/generate-image",
        { model: opts.modelId, prompt: opts.prompt, aspect: opts.aspect },
        onFrame,
        undefined,
        headers,
      );
    }

    if (!lastDataUrl) throw new Error("Generation returned no image");
    const path = await saveGeneration(userId, opts, lastDataUrl);
    opts.onSaved(index, path);

    if (perImageCost > 0) {
      const { error: spendError } = await supabase.rpc("spend_credits", { cost: perImageCost });
      if (spendError) {
        throw new Error(
          spendError.message.includes("Not enough credits")
            ? `Out of credits — this image cost ${perImageCost}. Top up on the pricing page.`
            : `Couldn't record credit usage: ${spendError.message}`,
        );
      }
    }
  }
}
