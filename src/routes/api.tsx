import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/api")({
  head: () => seo("API — Litemile Studio", "Developer access to Litemile Studio."),
  component: () => (
    <Page>
      <PageHeader title="API" subtitle="Developer access to Litemile Studio." />
      <EmptyState icon={<Sparkles className="size-5" />} title="Coming soon" body="This page is planned but not built yet." cta={{ to: "/", label: "Open image workspace" }} />
    </Page>
  ),
});
