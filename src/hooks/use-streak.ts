import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { UserStreak } from "@/types/user.types";

function toDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();
    setStreak((data as UserStreak) ?? null);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const ping = useCallback(async () => {
    if (!user) return;
    const today = toDate(new Date());
    const yesterday = toDate(new Date(Date.now() - 86_400_000));
    const current = streak?.current_streak ?? 0;
    const longest = streak?.longest_streak ?? 0;
    const last = streak?.last_active_date ?? null;
    if (last === today) return;
    const next = last === yesterday ? current + 1 : 1;
    const nextLongest = Math.max(longest, next);
    const { data } = await supabase
      .from("user_streaks")
      .upsert({ user_id: user.id, current_streak: next, longest_streak: nextLongest, last_active_date: today })
      .select("*")
      .single();
    if (data) setStreak(data as UserStreak);
  }, [user, streak]);

  return { streak, ping, reload: load };
}