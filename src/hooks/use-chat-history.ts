import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Conversation } from "@/types/chat.types";

export function useChatHistory(pageSize = 50) {
  const { user } = useAuth();
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("conversations")
        .select("id, user_id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(pageSize);
      if (!cancelled && data) setItems(data as Conversation[]);
      setLoading(false);
    }
    void load();
    const ch = supabase
      .channel("conversations-history")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(ch);
    };
  }, [user, pageSize]);

  return { items, loading };
}