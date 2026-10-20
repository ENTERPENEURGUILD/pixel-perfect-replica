import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/signup")({
  head: () => seo("Sign up — Litemile Studio", "Create your Litemile Studio account."),
  component: () => (
    <Page>
      <PageHeader title="Sign up" subtitle="Create your Litemile Studio account." />
      <EmptyState icon={<Sparkles className="size-5" />} title="Coming soon" body="This page is planned but not built yet." cta={{ to: "/", label: "Open image workspace" }} />
    </Page>
  ),
});
