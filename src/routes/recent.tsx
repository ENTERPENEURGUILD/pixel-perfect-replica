import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/recent")({
  head: () => seo("Recent Generations — Litemile Studio", "Your latest generations."),
  component: () => (
    <Page>
      <PageHeader title="Recent Generations" subtitle="Your latest generations." />
      <EmptyState icon={<Sparkles className="size-5" />} title="Coming soon" body="This page is planned but not built yet." cta={{ to: "/", label: "Open image workspace" }} />
    </Page>
  ),
});
