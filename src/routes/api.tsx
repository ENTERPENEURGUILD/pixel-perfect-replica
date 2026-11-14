import { createFileRoute } from "@tanstack/react-router";
import { DevBadge, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/api")({
  head: () => seo("API — Litemile Studio", "Developer access to image generation on Litemile Studio."),
  component: Api,
});

function Api() {
  return (
    <Page>
      <PageHeader
        eyebrow="Developers"
        title="Developer API"
        subtitle="Public API access is not available yet."
        actions={<DevBadge>Planned</DevBadge>}
      />
      <section className="max-w-2xl border-y py-8">
        <h2 className="font-display text-base font-bold">Current status</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          There is no public endpoint, API key creation, or developer access at this time. Image generation is
          available only through the signed-in Litemile Studio workspace.
        </p>
      </section>
    </Page>
  );
}
