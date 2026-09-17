import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getDiscoverFeed } from "@/lib/discover.functions";
import type { Phrase } from "@/types/discover.types";

export function useDiscoverFeed() {
  const fetchDiscover = useServerFn(getDiscoverFeed);

  const feedQuery = useQuery({
    queryKey: ["discover-feed"],
    queryFn: () => fetchDiscover(),
    staleTime: 1000 * 60 * 15,
    refetchInterval: 1000 * 60 * 30,
    retry: 1,
  });

  const phraseQuery = useQuery({
    queryKey: ["discover-phrase"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phrases")
        .select("*")
        .order("published_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Phrase | null) ?? null;
    },
    staleTime: 1000 * 60 * 60,
  });

  return {
    phrase: phraseQuery.data ?? null,
    hiring: feedQuery.data?.hiring ?? [],
    insight: feedQuery.data?.insight ?? null,
    weather: feedQuery.data?.weather ?? null,
    updatedAt: feedQuery.data?.updated_at ?? null,
    warnings: feedQuery.data?.warnings ?? [],
    loading: feedQuery.isPending || phraseQuery.isPending,
    error: feedQuery.error instanceof Error ? feedQuery.error.message : null,
    refresh: () => feedQuery.refetch(),
  };
}