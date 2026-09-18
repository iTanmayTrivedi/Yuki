import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CulturalInsight, DiscoverFeed, HiringPost } from "@/types/discover.types";

export const getDiscoverFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DiscoverFeed> => {
    const [{ fetchTokyoWeather }, { fetchJapanHiring }, culture] = await Promise.all([
      import("./discover-weather.server"),
      import("./discover-hiring.server"),
      import("./discover-culture.server"),
    ]);

    const warnings: string[] = [];
    const [weatherResult, hiringResult, cultureResult] = await Promise.allSettled([
      fetchTokyoWeather(),
      fetchJapanHiring(),
      culture.fetchCulturalInsight(),
    ]);

    const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
    if (weatherResult.status === "rejected") {
      console.warn("[Discover] Weather unavailable", weatherResult.reason);
      warnings.push("Weather is temporarily unavailable.");
    }

    let hiring: HiringPost[] = [];
    if (hiringResult.status === "fulfilled" && hiringResult.value.length > 0) {
      hiring = hiringResult.value;
      const liveRows = hiring.map(({ source: _source, id: _id, ...row }) => row);
      const urls = liveRows.flatMap((row) => row.url ? [row.url] : []);
      const { data: existing } = urls.length
        ? await context.supabase.from("hiring_posts").select("url").in("url", urls)
        : { data: [] };
      const existingUrls = new Set((existing ?? []).map((row) => row.url));
      const fresh = liveRows.filter((row) => row.url && !existingUrls.has(row.url));
      if (fresh.length > 0) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.from("hiring_posts").insert(fresh);
        if (error) console.warn("[Discover] Could not archive hiring feed", error.message);
      }
    } else {
      if (hiringResult.status === "rejected") console.warn("[Discover] Hiring unavailable", hiringResult.reason);
      const { data } = await context.supabase.from("hiring_posts").select("*").order("published_on", { ascending: false }).limit(5);
      hiring = (data ?? []).map((row) => ({ ...row, source: "Yuki archive" }));
      if (hiring.length === 0) warnings.push("Hiring updates are temporarily unavailable.");
    }

    let insight: CulturalInsight | null = cultureResult.status === "fulfilled" ? cultureResult.value : null;
    if (cultureResult.status === "rejected") {
      console.warn("[Discover] Culture unavailable", cultureResult.reason);
      const { data } = await context.supabase.from("cultural_insights").select("*").order("published_on", { ascending: false }).limit(1).maybeSingle();
      insight = data ? { ...data, source: "Yuki archive" } : null;
    }
    if (!insight) warnings.push("Cultural insight is temporarily unavailable.");

    return { weather, hiring, insight, updated_at: new Date().toISOString(), warnings };
  });