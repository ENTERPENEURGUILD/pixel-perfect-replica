import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/recent")({
  head: () => seo("Recent Generations — Litemile Studio", "Your latest image generations."),
  component: () => (
    <Page>
      <PageHeader title="Recent Generations" subtitle="Your latest generations, newest first." />
      <EmptyState
        icon={<Clock className="size-5" />}
        title="No generations yet"
        body="Every image you create will appear here for 30 days."
        cta={{ to: "/", label: "Open image workspace" }}
      />
    </Page>
  ),
});
