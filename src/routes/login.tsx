import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Divider, SocialButtons, submitClass } from "@/components/app/auth-ui";
import { Field, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/login")({
  head: () => seo("Log in — Litemile Studio", "Sign in to Litemile Studio."),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Sign-in failed", { description: error.message });
      return;
    }
    window.location.assign("/");
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back to the studio."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SocialButtons verb="sign in" />
      <Divider />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Signing in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
