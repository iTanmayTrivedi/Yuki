import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { UserPlan } from "@/types/user.types";
import { PLAN_LIMITS } from "@/lib/constants";

export function usePremium() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("user_plans").select("*").eq("user_id", user.id).maybeSingle();
    if (!data) {
      const { data: created } = await supabase
        .from("user_plans")
        .insert({ user_id: user.id, tier: "free", credits_limit: PLAN_LIMITS.free.credits })
        .select("*")
        .single();
      if (created) setPlan(created as UserPlan);
    } else {
      setPlan(data as UserPlan);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const isPro = plan?.tier === "pro" || plan?.tier === "founder";
  const remaining = plan ? Math.max(0, plan.credits_limit - plan.credits_used) : 0;

  return { plan, isPro, remaining, loading, reload: load };
}