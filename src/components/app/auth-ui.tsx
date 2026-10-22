import { Link, useRouter } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/app/AppShell";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76Z"
      />
    </svg>
  );
}

/** Social sign-in buttons. Calls must happen directly from the click handler. */
export function SocialButtons({ verb }: { verb: "continue" | "sign in" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handle = async (provider: "google" | "lovable") => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    setBusy(false);
    if (result.error) {
      toast.error(`${provider === "google" ? "Google" : "Lovable"} sign-in failed`, {
        description: result.error.message,
      });
      return;
    }
    if (result.redirected) return; // full-page browser redirect is under way
    await router.navigate({ to: "/" }); // tokens were exchanged in place
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => handle("google")}
        className="flex h-11 items-center justify-center gap-2.5 rounded-xl border bg-surface text-sm font-semibold transition hover:border-primary disabled:opacity-50"
      >
        <GoogleIcon />
        {verb === "continue" ? "Continue with Google" : "Sign in with Google"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => handle("lovable")}
        className="lovable-auth-button h-11 w-full"
      >
        {verb === "continue" ? "Continue with Lovable" : "Sign in with Lovable"}
      </button>
    </div>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8" aria-label="Litemile Studio home">
        <Logo />
      </Link>
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-panel md:p-8">
        <h1 className="font-display text-2xl font-black uppercase tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

export const submitClass =
  "mt-1 h-11 w-full rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-cta transition hover:opacity-90 disabled:opacity-50";
