import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, LogOut, Settings as SettingsIcon, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { performSignOut } from "@/lib/auth-actions";
import { EmptyState, Field, Page, PageHeader, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/settings")({
  head: () => seo("Settings — Litemile Studio", "Manage your Litemile Studio account."),
  component: Settings,
});

function useOwnProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, credits")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest text-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Settings() {
  const { user } = useSession();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const { data: profile } = useOwnProfile(user?.id ?? "");

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile?.display_name]);

  if (!user) {
    return (
      <Page>
        <PageHeader title="Settings" subtitle="Profile, password, credits and API keys." />
        <EmptyState
          icon={<SettingsIcon className="size-5" />}
          title="Sign in to manage settings"
          body="Your profile, password and preferences are managed here once you have an account."
          cta={{ to: "/login", label: "Log in" }}
        />
      </Page>
    );
  }

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    setSavingName(false);
    if (error) {
      toast.error("Couldn't save your name", { description: error.message });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile saved");
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) {
      toast.error("Couldn't update password", { description: error.message });
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Password updated");
  };

  const signOut = async () => {
    await performSignOut(queryClient, path === "/settings" ? undefined! : undefined!);
  };

  return (
    <Page>
      <PageHeader title="Settings" subtitle="Profile, password, credits and account." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile">
          <form onSubmit={saveName} className="flex flex-col gap-4">
            <Field label="Display name" htmlFor="display-name">
              <input
                id="display-name"
                required
                maxLength={40}
                className={inputClass}
                placeholder="How should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <button
              type="submit"
              disabled={savingName}
              className="h-10 w-fit rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-cta transition hover:opacity-90 disabled:opacity-50"
            >
              {savingName ? "Saving..." : "Save profile"}
            </button>
          </form>
        </Card>

        <Card title="Password">
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <Field label="New password" htmlFor="new-password">
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirm-password">
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
                placeholder="Repeat the new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <button
              type="submit"
              disabled={savingPassword}
              className="flex h-10 w-fit items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition hover:border-primary disabled:opacity-50"
            >
              <KeyRound className="size-4 text-primary" />
              {savingPassword ? "Updating..." : "Change password"}
            </button>
          </form>
        </Card>

        <Card title="Account">
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="truncate">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Credits</dt>
              <dd className="text-primary">
                {profile ? `${profile.credits} credits` : "Loading..."}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={async () => {
              await queryClient.cancelQueries();
              queryClient.clear();
              await supabase.auth.signOut();
              toast.success("Signed out");
            }}
            className="mt-5 flex h-10 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition hover:border-primary"
          >
            <LogOut className="size-4 text-primary" />
            Log out
          </button>
        </Card>
      </div>
    </Page>
  );
}
