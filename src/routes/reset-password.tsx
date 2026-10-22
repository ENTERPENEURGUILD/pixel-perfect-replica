import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, submitClass } from "@/components/app/auth-ui";
import { Field, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/reset-password")({
  head: () => seo("Reset password — Litemile Studio", "Set a new password for your Litemile Studio account."),
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      // Recovery links land with type=recovery in the hash and a session attached.
      setRecovery(Boolean(data.session) && window.location.hash.includes("type=recovery"));
      setChecked(true);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    // Recovery sessions are exempt from the current-password check.
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      if (/session/i.test(error.message)) {
        setRecovery(false);
        return;
      }
      toast.error("Couldn't update password", { description: error.message });
      return;
    }
    toast.success("Password updated");
    await router.navigate({ to: "/" });
  };

  if (!checked) return <AuthLayout title="Reset password">{null}</AuthLayout>;

  if (!recovery) {
    return (
      <AuthLayout
        title="Link expired"
        footer={
          <Link to="/forgot-password" className="text-primary hover:underline">
            Request a new reset link
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Request a fresh one and it will arrive by
          email.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            autoComplete="new-password"
            className={inputClass}
            placeholder="Repeat the new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
