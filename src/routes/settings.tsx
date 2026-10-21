import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/settings")({
  head: () => seo("Settings — Litemile Studio", "Manage your Litemile Studio account."),
  component: () => (
    <Page>
      <PageHeader title="Settings" subtitle="Profile, password, credits and API keys." />
      <EmptyState
        icon={<SettingsIcon className="size-5" />}
        title="Sign in to manage settings"
        body="Your profile, password and preferences are managed here once you have an account."
        cta={{ to: "/login", label: "Log in" }}
      />
    </Page>
  ),
});
