import { createFileRoute } from "@tanstack/react-router";
import { MODELS, QUALITY_LABEL, STATUS_LABEL, type ModelStatus } from "@/lib/catalog";
import { DevBadge, Page, PageHeader, seo } from "@/components/app/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/models")({
  head: () => seo("Models — Litemile Studio", "Compare AI image models, their strengths and their credit cost."),
  component: Models,
});

const STATUS_STYLE: Record<ModelStatus, string> = {
  available: "border-primary/40 text-primary",
  not_connected: "border-border text-muted-foreground",
  coming_soon: "border-border text-muted-foreground",
};

function baseCosts(model: (typeof MODELS)[number]): number[] {
  return model.qualities
    .map((q) => model.baseCost[q])
    .filter((n): n is number => typeof n === "number");
}

function Models() {
  return (
    <Page>
      <PageHeader
        eyebrow="Catalogue"
        title="Models"
        subtitle="Every model, what it does best and what it costs in credits."
        actions={<DevBadge />}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODELS.map((m) => {
          const costs = baseCosts(m);
          return (
            <article key={m.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-panel">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-extrabold">{m.name}</h2>
                  <p className="text-xs text-muted-foreground">{m.provider}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
                    STATUS_STYLE[m.status],
                  )}
                >
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {m.capabilities.map((c) => (
                  <span key={c} className="rounded-md bg-secondary px-2 py-1 text-xs">
                    {c}
                  </span>
                ))}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Aspect ratios</dt>
                  <dd className="text-right">{m.aspectRatios.join(" · ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Resolutions</dt>
                  <dd className="text-right">{m.resolutions.join(" · ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Per run</dt>
                  <dd className="text-right">Up to {m.maxImages} images</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Reference image</dt>
                  <dd className="text-right">{m.supportsReference ? "Supported" : "Not supported"}</dd>
                </div>
              </dl>
              <div className="mt-auto pt-4">
                <p className="text-sm">
                  <span className="font-bold text-primary">{Math.min(...costs)}</span>
                  <span> credits per image</span>
                  <span className="text-muted-foreground">
                    {" · "}
                    {m.qualities.map((q) => QUALITY_LABEL[q]).join("/")}
                  </span>
                </p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-8 rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
        <h2 className="font-display text-base font-bold text-foreground">Resolution multiplier</h2>
        <p className="mt-2">
          Costs above are per image at 1K. 2K images cost 1.5× and 4K images cost 2.5× the listed price.
          Choose more than one image in a run and the cost adds up per image.
        </p>
      </div>
    </Page>
  );
}
