import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  credits: number;
}

/** Shared profile query — one cache entry per user across the app. */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, credits")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
