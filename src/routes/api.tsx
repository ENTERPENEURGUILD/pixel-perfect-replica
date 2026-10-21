import { createFileRoute } from "@tanstack/react-router";
import { DevBadge, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/api")({
  head: () => seo("API — Litemile Studio", "Developer access to image generation on Litemile Studio."),
  component: Api,
});

const STEPS = [
  { n: "1", title: "Create an account", body: "Sign up for Litemile Studio and top up credits." },
  { n: "2", title: "Generate an API key", body: "From Settings once API access is live on your account." },
  { n: "3", title: "Call the API", body: "One POST per generation. Credits are deducted per image." },
];

const CURL = `curl https://api.litemile.studio/v1/generations \\
  -H "Authorization: Bearer $LITEMILE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "Minimal coffee bag on wet black rocks",
    "aspect_ratio": "1:1",
    "quality": "high"
  }'`;

const JS = `const res = await fetch("https://api.litemile.studio/v1/generations", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.LITEMILE_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-image-2",
    prompt: "Minimal coffee bag on wet black rocks",
    aspect_ratio: "1:1",
    quality: "high",
  }),
});
const { images } = await res.json();`;

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border bg-surface p-4 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Api() {
  return (
    <Page>
      <PageHeader
        eyebrow="Developers"
        title="API"
        subtitle="Generate images programmatically with the same models and credits as the studio."
        actions={<DevBadge>Planned</DevBadge>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl border bg-card p-5">
            <span className="font-display text-2xl font-black text-primary">{s.n}</span>
            <h2 className="mt-2 font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">Request</h2>
          <Code>{CURL}</Code>
        </section>
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-base font-bold">JavaScript</h2>
          <Code>{JS}</Code>
        </section>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        The API is not live yet — endpoints and the key format shown here are placeholders. Sign up and we'll
        email you when access opens.
      </p>
    </Page>
  );
}
