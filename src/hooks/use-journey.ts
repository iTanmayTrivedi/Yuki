import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Journey } from "@/types/user.types";

export function useJourneys() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("journeys")
      .select("*")
      .order("last_active_at", { ascending: false });
    if (data) setJourneys(data as Journey[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const create = useCallback(async (input: Pick<Journey, "title"> & Partial<Journey>) => {
    if (!user) return null;
    const { data } = await supabase
      .from("journeys")
      .insert({ user_id: user.id, ...input })
      .select("*")
      .single();
    if (data) setJourneys((j) => [data as Journey, ...j]);
    return data as Journey | null;
  }, [user]);

  const updateProgress = useCallback(async (id: string, progress_pct: number) => {
    const { data } = await supabase
      .from("journeys")
      .update({ progress_pct, last_active_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (data) setJourneys((prev) => prev.map((j) => (j.id === id ? (data as Journey) : j)));
  }, []);

  return { journeys, loading, create, updateProgress, reload: load };
}