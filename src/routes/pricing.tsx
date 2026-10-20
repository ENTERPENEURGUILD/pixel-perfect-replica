import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/pricing")({
  head: () => seo("Pricing — Litemile Studio", "Credit packages and pricing."),
  component: () => (
    <Page>
      <PageHeader title="Pricing" subtitle="Credit packages and pricing." />
      <EmptyState icon={<Sparkles className="size-5" />} title="Coming soon" body="This page is planned but not built yet." cta={{ to: "/", label: "Open image workspace" }} />
    </Page>
  ),
});
