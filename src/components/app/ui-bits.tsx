import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">{children}</div>;
}

export function DevBadge({ children = "Development data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-2.5 py-1 text-[0.7rem] font-medium text-primary">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  cta?: { to: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-surface px-6 py-16 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-card text-primary">{icon}</div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export function Field({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border bg-surface px-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none";

export function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={
            value === o
              ? "rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm text-primary"
              : "rounded-lg border bg-surface px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          }
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function seo(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
