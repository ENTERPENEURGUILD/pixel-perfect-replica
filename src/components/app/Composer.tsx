import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Copy, ImagePlus, Layers3, Maximize, Monitor, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
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
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (!prompt.trim()) {
      toast.error("Write a prompt first.");
      return;
    }
    toast("Generation isn't connected yet", {
      description: `${model.name} is ${STATUS_LABEL[model.status].toLowerCase()}. No image was created and no credits were used.`,
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
          <Sparkles className="size-5" />
          <span className="text-left leading-tight">
            <span className="block text-lg font-bold">Generate</span>
            <span className="block text-xs opacity-75">
              {cost === null ? "Unavailable" : `${cost} credits`}
            </span>
          </span>
        </button>
      </div>
      <p className="mt-3 px-1 text-xs text-muted-foreground">
        {model.provider} · {STATUS_LABEL[model.status]} · Estimates use development pricing.
      </p>
    </div>
  );
}
