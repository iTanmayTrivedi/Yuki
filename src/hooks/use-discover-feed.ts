import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CulturalInsight, HiringPost, Phrase } from "@/types/discover.types";

export function useDiscoverFeed() {
  const [phrase, setPhrase] = useState<Phrase | null>(null);
  const [hiring, setHiring] = useState<HiringPost[]>([]);
  const [insight, setInsight] = useState<CulturalInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [p, h, i] = await Promise.all([
        supabase.from("phrases").select("*").order("published_on", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("hiring_posts").select("*").order("published_on", { ascending: false }).limit(5),
        supabase.from("cultural_insights").select("*").order("published_on", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (cancelled) return;
      setPhrase((p.data as Phrase) ?? null);
      setHiring((h.data as HiringPost[]) ?? []);
      setInsight((i.data as CulturalInsight) ?? null);
      setLoading(false);
    }
    void load();
    const timer = setInterval(load, 1000 * 60 * 60 * 6);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { phrase, hiring, insight, loading };
}