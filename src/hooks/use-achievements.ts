import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Achievement, UserAchievement } from "@/types/user.types";

export function useAchievements() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, u] = await Promise.all([
      supabase.from("achievements").select("*"),
      user ? supabase.from("user_achievements").select("*") : Promise.resolve({ data: [] as UserAchievement[] }),
    ]);
    if (a.data) setCatalog(a.data as Achievement[]);
    if (u.data) setUnlocked(u.data as UserAchievement[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const unlock = useCallback(async (achievement_id: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("user_achievements")
      .insert({ user_id: user.id, achievement_id })
      .select("*")
      .single();
    if (data) setUnlocked((u) => [...u, data as UserAchievement]);
  }, [user]);

  return { catalog, unlocked, loading, unlock, reload: load };
}