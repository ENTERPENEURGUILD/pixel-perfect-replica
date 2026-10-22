import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Divider, SocialButtons, submitClass } from "@/components/app/auth-ui";
import { Field, inputClass, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/signup")({
  head: () => seo("Sign up — Litemile Studio", "Create your Litemile Studio account."),
  component: Signup,
});

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: name },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Sign-up failed", { description: error.message });
      return;
    }
    if (data.session) {
      // Email confirmation is off for this account — go straight in.
      window.location.assign("/");
      return;
    }
    setSubmitted(true); // waiting on the confirmation email
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        footer={
          <>
            Already confirmed?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
            <MailCheck className="size-6" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it to
            activate your account, then log in.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start turning ideas into images."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SocialButtons verb="continue" />
      <Divider />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Display name" htmlFor="name">
          <input
            id="name"
            required
            maxLength={40}
            autoComplete="nickname"
            className={inputClass}
            placeholder="How should we call you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
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
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button type="submit" disabled={busy} className={submitClass}>
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
