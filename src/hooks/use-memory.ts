import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { MemoryFact } from "@/types/user.types";

export function useMemory() {
  const { user } = useAuth();
  const [facts, setFacts] = useState<MemoryFact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_memory")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (data) setFacts(data as MemoryFact[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const add = useCallback(async (fact: string, category = "general") => {
    if (!user) return;
    const { data } = await supabase
      .from("user_memory")
      .insert({ user_id: user.id, fact, category })
      .select("*")
      .single();
    if (data) setFacts((f) => [data as MemoryFact, ...f]);
  }, [user]);

  const forget = useCallback(async (id: string) => {
    await supabase.from("user_memory").update({ active: false }).eq("id", id);
    setFacts((f) => f.filter((x) => x.id !== id));
  }, []);

  return { facts, loading, add, forget, reload: load };
}