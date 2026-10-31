import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Copy, Download, ImagePlus, Layers3, Loader2, Maximize, Monitor, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MODELS,
  QUALITY_LABEL,
  STATUS_LABEL,
  estimateCost,
  getModel,
  type Quality,
  type Resolution,
} from "@/lib/catalog";
import { runGeneration } from "@/lib/generation-client";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

interface ResultSlot {
  index: number;
  dataUrl: string;
  final: boolean;
  savedPath?: string;
}

function Control({
  icon,
  value,
  onChange,
  options,
  label,
}: {
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="h-11 gap-2 rounded-xl border bg-surface px-3 text-sm">
        <span className="text-muted-foreground">{icon}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ResultCard({ slot }: { slot: ResultSlot }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-surface">
      <div className="relative aspect-square">
        <img
          src={slot.dataUrl}
          alt={slot.final ? "Generated image" : "Generating a preview"}
          className={cn("absolute inset-0 size-full object-cover", !slot.final && "scale-105 blur-2xl")}
        />
        {!slot.final && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-xs font-medium backdrop-blur">
              <Loader2 className="size-4 animate-spin text-primary" />
              Generating…
            </span>
          </div>
        )}
      </div>
      {slot.final && (
        <div className="flex items-center justify-between border-t px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {slot.savedPath ? "Saved to Library" : "Saving…"}
          </span>
          {slot.savedPath && (
            <a
              href={slot.dataUrl}
              download="litemile-studio.png"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              aria-label="Download image"
            >
              <Download className="size-3.5" /> Download
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export interface ComposerProps {
  placeholder?: string;
  defaultAspect?: string | undefined;
  /** Multiplies the per-run cost (e.g. number of campaign assets). */
  runs?: number;
  /** Additional fields rendered above the prompt. */
  children?: ReactNode;
  showReference?: boolean;
}

export function Composer({
  placeholder = "Describe the image you want to create...",
  defaultAspect,
  runs = 1,
  children,
  showReference = true,
}: ComposerProps) {
  const [modelId, setModelId] = useState(MODELS[0]!.id);
  const model = getModel(modelId);
  const [aspect, setAspect] = useState(defaultAspect ?? model.aspectRatios[0]!);
  const [quality, setQuality] = useState<Quality>(model.qualities.at(-1)!);
  const [resolution, setResolution] = useState<Resolution>(model.resolutions[0]!);
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [reference, setReference] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ResultSlot[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Keep selections valid for the current model's real capabilities.
  useEffect(() => {
    if (!model.aspectRatios.includes(aspect)) setAspect(model.aspectRatios[0]!);
    if (!model.qualities.includes(quality)) setQuality(model.qualities.at(-1)!);
    if (!model.resolutions.includes(resolution)) setResolution(model.resolutions[0]!);
    if (count > model.maxImages) setCount(model.maxImages);
    if (!model.supportsReference) setReference(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  const cost = useMemo(() => {
    const c = estimateCost({ modelId, quality, resolution, count });
    return c === null ? null : Math.round(c * runs * 10) / 10;
  }, [modelId, quality, resolution, count, runs]);

  const onGenerate = () => {
    if (busy) return;
    if (!prompt.trim()) {
      toast.error("Write a prompt first.");
      return;
    }
    if (!model.gatewayModel || model.status !== "available") {
      toast.error(`${model.name} isn't connected yet. Pick an available model.`);
      return;
    }
    if (!user) {
      toast.error("Sign in to generate images", {
        description: "Create a free account — your credits and library are waiting.",
      });
      return;
    }
    if (cost !== null && profile && profile.credits < cost) {
      toast.error(`Only ${profile.credits} credits left — this run costs ${cost}.`, {
        description: "Top up on the pricing page to keep creating.",
        action: { label: "Top up", onClick: () => void navigate({ to: "/pricing" }) },
      });
      return;
    }
    setBusy(true);
    setResults([]);
    void runGeneration({
      modelId,
      prompt: prompt.trim(),
      aspect,
      count,
      reference,
      onFrame: (index, dataUrl, isFinal) => {
        setResults((prev) => {
          const next = prev.filter((r) => r.index !== index);
          next.push({ index, dataUrl, final: isFinal });
          return next.sort((a, b) => a.index - b.index);
        });
      },
      onSaved: (index, savedPath) => {
        setResults((prev) =>
          prev.map((r) => (r.index === index ? { ...r, savedPath } : r)),
        );
      },
    })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Generation failed");
      })
      .finally(() => {
        setBusy(false);
        if (user) {
          void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
          void queryClient.invalidateQueries({ queryKey: ["generations", user.id] });
        }
      });
  };

  return (
    <div className="rounded-3xl border bg-card p-4 shadow-panel md:p-5">
      {children && <div className="mb-4 grid gap-4 md:grid-cols-2">{children}</div>}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="prompt" className="sr-only">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={2}
            maxLength={2000}
            className="w-full resize-none bg-transparent px-1 text-base placeholder:text-muted-foreground focus:outline-none"
          />
          {reference && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-lg border bg-surface px-3 py-1.5 text-xs">
              <ImagePlus className="size-3.5 text-primary" />
              <span className="max-w-48 truncate">{reference.name}</span>
              <button aria-label="Remove reference" onClick={() => setReference(null)}>
                <X className="size-3.5" />
              </button>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {showReference && model.supportsReference && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => setReference(e.target.files?.[0] ?? null)}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid size-11 place-items-center rounded-xl border bg-surface hover:border-primary"
                  aria-label="Upload reference image"
                  title="Reference image (optional)"
                >
                  <ImagePlus className="size-4" />
                </button>
              </>
            )}
            <Control
              label="Model"
              icon={<Sparkles className="size-4" />}
              value={modelId}
              onChange={setModelId}
              options={MODELS.map((m) => ({ value: m.id, label: m.name }))}
            />
            <Control
              label="Aspect ratio"
              icon={<Maximize className="size-4" />}
              value={aspect}
              onChange={setAspect}
              options={model.aspectRatios.map((a) => ({ value: a, label: a }))}
            />
            {model.qualities.length > 1 && (
              <Control
                label="Quality"
                icon={<Layers3 className="size-4" />}
                value={quality}
                onChange={(v) => setQuality(v as Quality)}
                options={model.qualities.map((q) => ({ value: q, label: QUALITY_LABEL[q] }))}
              />
            )}
            <Control
              label="Resolution"
              icon={<Monitor className="size-4" />}
              value={resolution}
              onChange={(v) => setResolution(v as Resolution)}
              options={model.resolutions.map((r) => ({ value: r, label: r }))}
            />
            <Control
              label="Number of images"
              icon={<Copy className="size-4" />}
              value={String(count)}
              onChange={(v) => setCount(Number(v))}
              options={Array.from({ length: model.maxImages }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1} image${i ? "s" : ""}`,
              }))}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={cost === null}
          className="flex min-h-16 shrink-0 items-center justify-center gap-3 rounded-2xl bg-primary px-8 text-primary-foreground shadow-cta transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          <span className="text-left leading-tight">
            <span className="block text-lg font-bold">{busy ? "Generating" : "Generate"}</span>
            <span className="block text-xs opacity-75">
              {cost === null ? "Unavailable" : `${cost} credits`}
            </span>
          </span>
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {results.map((slot) => (
            <ResultCard key={slot.index} slot={slot} />
          ))}
        </div>
      )}
      <p className="mt-3 px-1 text-xs text-muted-foreground">
        {model.provider} · {STATUS_LABEL[model.status]} · Estimates use development pricing.
      </p>
    </div>
  );
}
