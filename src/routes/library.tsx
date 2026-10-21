import { createFileRoute } from "@tanstack/react-router";
import { Library as LibraryIcon } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/library")({
  head: () => seo("Library — Litemile Studio", "Your saved images, organised and ready to reuse."),
  component: () => (
    <Page>
      <PageHeader title="Library" subtitle="Your saved images, organised and ready to reuse." />
      <EmptyState
        icon={<LibraryIcon className="size-5" />}
        title="Sign in to build your library"
        body="Images you save from generations will live here, sorted and searchable."
        cta={{ to: "/signup", label: "Create account" }}
      />
    </Page>
  ),
});
