import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Library as LibraryIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { signedUrl } from "@/lib/generation-client";
import { EmptyState, Page, PageHeader, seo } from "@/components/app/ui-bits";

export const Route = createFileRoute("/library")({
  head: () => seo("Library — Litemile Studio", "Your saved images, organised and ready to reuse."),
  component: LibraryPage,
});

function dateOf(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function LibraryGrid() {
  const { user } = useSession();
  const { data: rows, isPending } = useQuery({
    queryKey: ["generations", user!.id, "library"],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("id, prompt, model_id, aspect, image_url, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(120);
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
        icon={<LibraryIcon className="size-5" />}
        title="No images yet"
        body="Generate your first image and it will appear here, saved and ready to reuse."
        cta={{ to: "/", label: "Open image workspace" }}
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <figure key={row.id} className="overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-square bg-surface">
            {row.url && (
              <img
                src={row.url}
                alt={row.prompt.slice(0, 80)}
                loading="lazy"
                className="size-full object-cover"
              />
            )}
          </div>
          <figcaption className="space-y-1 p-3">
            <p className="line-clamp-2 text-sm">{row.prompt}</p>
            <p className="text-xs text-muted-foreground">
              {row.model_id} · {row.aspect} · {dateOf(row.created_at)}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function LibraryPage() {
  const { user } = useSession();
  return (
    <Page>
      <PageHeader title="Library" subtitle="Your saved images, organised and ready to reuse." />
      {user ? (
        <LibraryGrid />
      ) : (
        <EmptyState
          icon={<LibraryIcon className="size-5" />}
          title="Sign in to build your library"
          body="Images you save from generations will live here, sorted and searchable."
          cta={{ to: "/login", label: "Log in" }}
        />
      )}
    </Page>
  );
}
