import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/library")({
  head: () => seo("Library — Litemile Studio", "Your saved images."),
  component: () => (
    <Page>
      <PageHeader title="Library" subtitle="Your saved images." />
      <EmptyState icon={<Sparkles className="size-5" />} title="Coming soon" body="This page is planned but not built yet." cta={{ to: "/", label: "Open image workspace" }} />
    </Page>
  ),
});
