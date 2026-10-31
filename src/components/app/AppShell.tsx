import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Clock,
  Image as ImageIcon,
  Layers,
  Library,
  LogOut,
  Menu,
  Play,
  Settings,
  Tag,
  Zap,
} from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const TOP_NAV = [
  { to: "/explore", label: "Explore" },
  { to: "/", label: "Image" },
  { to: "/models", label: "Models" },
  { to: "/api", label: "API" },
  { to: "/pricing", label: "Pricing" },
] as const;

const STUDIOS = [
  { to: "/product-studio", label: "Product Studio", hint: "Create product visuals", icon: ImageIcon },
  { to: "/branding-studio", label: "Branding Studio", hint: "Logos & brand assets", icon: Tag },
  { to: "/creator-studio", label: "Creator Studio", hint: "Social content & thumbnails", icon: Play },
  { to: "/campaigns", label: "Creative Campaigns", hint: "Consistent visual sets", icon: Layers },
] as const;

const UTILITY = [
  { to: "/library", label: "Library", icon: Library },
  { to: "/recent", label: "Recent Generations", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Litemile Studio home">
      <img src={logo} alt="" width={44} height={29} className="h-7 w-auto" />
      <span className="leading-none">
        <span className="block font-display text-lg font-extrabold tracking-wide">LITEMILE</span>
        <span className="block text-[0.6rem] tracking-[0.35em] text-muted-foreground">STUDIO</span>
      </span>
    </Link>
  );
}

function SidebarNav({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label="Studios">
      {STUDIOS.map(({ to, label, hint, icon: Icon }) => {
        const active = path === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:bg-card",
              active && "border-border bg-card",
            )}
          >
            {active && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-primary" />}
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-foreground",
                active && "text-primary",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className={cn("block text-sm font-semibold", active && "text-primary")}>{label}</span>
              <span className="block truncate text-xs text-muted-foreground">{hint}</span>
            </span>
          </Link>
        );
      })}
      <div className="mt-auto border-t pt-3">
        {UTILITY.map(({ to, label, icon: Icon }) => {
          const active = path === to || (to === "/library" && path.startsWith("/library"));
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
                active && "bg-card text-primary",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const bare = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(path);

  if (bare) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="grid size-9 place-items-center rounded-lg border lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-background p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="border-b p-4">
              <Logo />
            </div>
            <div className="flex flex-col gap-1 border-b p-3 md:hidden">
              {TOP_NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={cn("rounded-lg px-3 py-2 text-sm", path === n.to && "text-primary")}
                >
                  {n.label}
                </Link>
              ))}
            </div>
            <SidebarNav path={path} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <Logo />

        <nav className="ml-8 hidden items-center gap-1 md:flex" aria-label="Main">
          {TOP_NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "relative px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-primary hover:text-primary",
                )}
              >
                {n.label}
                {active && <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CreditsChip />
          <AccountMenu />
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 border-r lg:block">
          <SidebarNav path={path} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function initialsOf(name: string | null | undefined, email?: string | null) {
  const source = name?.trim() || email || "L";
  const parts = source.split(/[\s._@-]+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "L"
  );
}

function CreditsChip() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  return (
    <Link
      to="/pricing"
      className="hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm sm:flex"
      title={user ? "Your credit balance" : "Sign in to see your balance"}
    >
      <Zap className="size-4 text-primary" />
      <span className="text-primary">
        {user ? (profile ? `${profile.credits} credits` : "… credits") : "0 credits"}
      </span>
    </Link>
  );
}

function AccountMenu() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: profile } = useProfile(user?.id);

  if (!user) {
    return (
      <>
        <Link to="/login" className="rounded-lg border px-3 py-2 text-sm hover:bg-card">
          Log in
        </Link>
        <Link
          to="/signup"
          className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:block"
        >
          Create account
        </Link>
      </>
    );
  }

  const email = user.email ?? "";
  const label = profile?.display_name || email;
  const initials = initialsOf(profile?.display_name, email);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await router.navigate({ to: "/login", replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm hover:bg-card"
        aria-label="Account menu"
      >
        <span className="grid size-7 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">
          {initials}
        </span>
        <span className="hidden max-w-32 truncate sm:block">{label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{label}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/library">Library</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/recent">Recent Generations</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut()} className="gap-2 text-primary">
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
