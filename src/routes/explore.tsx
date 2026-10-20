import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/explore")({
  head: () => seo("Explore — Litemile Studio", "Discover styles and inspiration."),
  component: () => (
    <Page>
      <PageHeader title="Explore" subtitle="Discover styles and inspiration." />
      <EmptyState icon={<Sparkles className="size-5" />} title="Coming soon" body="This page is planned but not built yet." cta={{ to: "/", label: "Open image workspace" }} />
    </Page>
  ),
});
