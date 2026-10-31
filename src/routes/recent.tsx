import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { signedUrl } from "@/lib/generation-client";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/recent")({
  head: () => seo("Recent Generations — Litemile Studio", "Your latest image generations."),
  component: RecentPage,
});

function timeOf(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RecentGrid() {
  const { user } = useSession();
  const { data: rows, isPending } = useQuery({
    queryKey: ["generations", user!.id, "recent"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("id, prompt, model_id, aspect, image_url, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return Promise.all(
        (data ?? []).map(async (row) => ({ ...row, url: await signedUrl(row.image_url) })),
      );
    },
  });

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!rows?.length) {
    return (
      <EmptyState
        icon={<Clock className="size-5" />}
        title="No generations yet"
        body="Every image you create will appear here for 30 days."
        cta={{ to: "/", label: "Open image workspace" }}
      />
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-4 rounded-2xl border bg-card p-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface">
            {row.url && (
              <img
                src={row.url}
                alt={row.prompt.slice(0, 60)}
                loading="lazy"
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm">{row.prompt}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {row.model_id} · {timeOf(row.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentPage() {
  const { user } = useSession();
  return (
    <Page>
      <PageHeader title="Recent Generations" subtitle="Your latest generations, newest first." />
      {user ? (
        <RecentGrid />
      ) : (
        <EmptyState
          icon={<Clock className="size-5" />}
          title="Sign in to see your history"
          body="Your latest generations will be listed here, newest first."
          cta={{ to: "/login", label: "Log in" }}
        />
      )}
    </Page>
  );
}
