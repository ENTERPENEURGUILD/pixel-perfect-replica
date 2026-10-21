import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { CREDIT_PACKAGES, MODELS, QUALITY_LABEL } from "@/lib/catalog";
import { DevBadge, Page, PageHeader, seo } from "@/components/app/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => seo("Pricing — Litemile Studio", "Credit packages and per-image pricing for Litemile Studio."),
  component: Pricing,
});

function Pricing() {
  return (
    <Page>
      <PageHeader
        eyebrow="Credits"
        title="Pricing"
        subtitle="Buy credits once — they never expire. Every image simply deducts its cost."
        actions={<DevBadge />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {CREDIT_PACKAGES.map((p) => (
          <article
            key={p.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-card p-6",
              p.highlight && "border-primary shadow-panel",
            )}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Most popular
              </span>
            )}
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide">{p.name}</h2>
            <p className="mt-3 flex items-baseline gap-2">
              <Zap className="size-5 text-primary" aria-hidden />
              <span className="font-display text-4xl font-black text-primary">{p.credits}</span>
              <span className="text-sm text-muted-foreground">credits</span>
            </p>
            <p className="mt-2 text-2xl font-bold">₹{p.priceInr.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ₹{(p.priceInr / p.credits).toFixed(2)} per credit
            </p>
            <button
              type="button"
              onClick={() =>
                toast("Payments aren't connected yet", {
                  description: "Razorpay checkout is planned. No charge was made.",
                })
              }
              className={cn(
                "mt-6 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                p.highlight
                  ? "bg-primary text-primary-foreground shadow-cta hover:opacity-90"
                  : "border hover:border-primary",
              )}
            >
              Buy credits
            </button>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="font-display text-base font-bold">What an image costs</h2>
        <p className="mt-1 text-sm text-muted-foreground">Per image at 1K resolution, in credits.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-96 text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Model</th>
                {["low", "medium", "high"].map((q) => (
                  <th key={q} className="py-2 pr-4 font-medium">
                    {QUALITY_LABEL[q as keyof typeof QUALITY_LABEL]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{m.name}</td>
                  {["low", "medium", "high"].map((q) => (
                    <td key={q} className="py-2.5 pr-4">
                      {m.baseCost[q as keyof typeof m.baseCost] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          2K images cost 1.5× and 4K images 2.5× the listed price. Estimates use development pricing.
        </p>
      </div>
    </Page>
  );
}
