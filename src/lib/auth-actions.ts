import type { QueryClient } from "@tanstack/react-query";
import type { Router } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ordered sign-out: stop in-flight queries before their bearers go stale,
 * drop cached protected data, clear the session, then replace history so
 * Back cannot restore a protected route.
 */
export async function performSignOut(queryClient: QueryClient, router: Router) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  await router.navigate({ to: "/login", replace: true });
}
