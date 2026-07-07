export type Role = "user" | "assistant" | "system";

export type Intent =
  | "career"
  | "visa"
  | "language"
  | "travel"
  | "culture"
  | "general";

export type Register = "keigo" | "polite" | "casual";

export type Message = {
  id: string;
  role: Role;
  content: string;
  intent?: Intent;
  rich?: RichResponse | null;
  created_at?: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string | null;
};

export type StreamChunk =
  | { type: "token"; text: string }
  | { type: "done"; message: Message }
  | { type: "error"; error: string };

export type RoadmapMilestone = {
  when: string; // e.g. "Q1 2027" or "2028-04"
  title: string;
  detail: string;
  done?: boolean;
};

export type ItineraryDay = {
  day: number;
  city: string;
  highlights: string[];
};

export type RichResponse =
  | { kind: "roadmap"; title: string; milestones: RoadmapMilestone[] }
  | { kind: "timeline"; title: string; entries: RoadmapMilestone[] }
  | { kind: "itinerary"; destination: string; days: ItineraryDay[] }
  | { kind: "card"; title: string; body: string; footer?: string };

*** Add File: src/types/user.types.ts
export type PlanTier = "free" | "pro" | "founder";

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  location: string | null;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UserPlan = {
  user_id: string;
  tier: PlanTier;
  credits_used: number;
  credits_limit: number;
  billing_date: string | null;
};

export type MemoryFact = {
  id: string;
  user_id: string;
  fact: string;
  category: string;
  confidence: number;
  source: string;
  active: boolean;
  created_at?: string;
};

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  criteria: Record<string, number>;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: Record<string, number>;
};

export type UserStreak = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
};

export type Journey = {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  category: string;
  target_date: string | null;
  progress_pct: number;
  milestone_count: number;
  last_active_at: string;
};

*** Add File: src/types/discover.types.ts
export type Phrase = {
  id: string;
  kanji: string;
  romaji: string;
  meaning: string;
  cultural_note: string | null;
  level: string;
  published_on: string;
};

export type HiringPost = {
  id: string;
  company: string;
  role: string;
  location: string;
  url: string | null;
  tags: string[];
  published_on: string;
};

export type CulturalInsight = {
  id: string;
  title: string;
  concept: string;
  body: string;
  published_on: string;
};

export type WeatherData = {
  city: string;
  temp_c: number;
  condition: string;
  high_c: number;
  low_c: number;
};

*** Add File: src/lib/constants.ts
import type { PlanTier } from "@/types/user.types";

export const APP_NAME = "Yuki";
export const APP_TAGLINE = "Your AI companion for Japan";

export const PLAN_LIMITS: Record<PlanTier, { credits: number; label: string }> = {
  free:    { credits: 100,   label: "Free" },
  pro:     { credits: 2000,  label: "Pro" },
  founder: { credits: 10000, label: "Founder" },
};

export const INTENT_LABELS = {
  career:   "Career & work",
  visa:     "Visa & moving",
  language: "Language",
  travel:   "Travel",
  culture:  "Culture",
  general:  "General",
} as const;

export const FEATURE_FLAGS = {
  thinkDeeper: true,
  richResponses: true,
  memory: true,
  streaks: true,
  discover: true,
  premium: false,
} as const;

export const CHAT_API_PATH = "/functions/v1/chat";

*** Add File: src/lib/formatters.ts
/** Human date, always in the user's locale. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "3m ago", "2h ago", "Yesterday", or a short date. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/** Kanji/kana-safe truncation. */
export function truncate(input: string, max = 60): string {
  const arr = [...input];
  return arr.length <= max ? input : arr.slice(0, max).join("") + "…";
}

/** Nicely formats a number of credits: 1200 -> "1.2k". */
export function formatCredits(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Japan-native date (令和年月日 style, lightweight). */
export function formatJP(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

*** Add File: src/store/user-store.ts
import { create } from "zustand";
import type { MemoryFact, UserPlan, UserProfile, UserStreak } from "@/types/user.types";

type State = {
  profile: UserProfile | null;
  plan: UserPlan | null;
  memory: MemoryFact[];
  streak: UserStreak | null;
  setProfile: (p: UserProfile | null) => void;
  setPlan: (p: UserPlan | null) => void;
  setMemory: (m: MemoryFact[]) => void;
  addMemory: (m: MemoryFact) => void;
  setStreak: (s: UserStreak | null) => void;
  reset: () => void;
};

export const useUserStore = create<State>((set) => ({
  profile: null,
  plan: null,
  memory: [],
  streak: null,
  setProfile: (profile) => set({ profile }),
  setPlan: (plan) => set({ plan }),
  setMemory: (memory) => set({ memory }),
  addMemory: (m) => set((s) => ({ memory: [m, ...s.memory] })),
  setStreak: (streak) => set({ streak }),
  reset: () => set({ profile: null, plan: null, memory: [], streak: null }),
}));

*** Add File: src/store/ui-store.ts
import { create } from "zustand";

type Theme = "light" | "dark" | "system";

type State = {
  sidebarOpen: boolean;
  discoverOpen: boolean;
  theme: Theme;
  thinkDeeper: boolean;
  setSidebar: (v: boolean) => void;
  setDiscover: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  setThinkDeeper: (v: boolean) => void;
};

export const useUIStore = create<State>((set) => ({
  sidebarOpen: false,
  discoverOpen: true,
  theme: "system",
  thinkDeeper: false,
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
  setDiscover: (discoverOpen) => set({ discoverOpen }),
  setTheme: (theme) => set({ theme }),
  setThinkDeeper: (thinkDeeper) => set({ thinkDeeper }),
}));

*** Add File: src/store/chat-store.ts
// Re-export for the canonical /store/ path used across the app tree.
// The runtime source lives at src/lib/chat-store.ts to preserve
// existing imports; both paths reference the same Zustand store.
export { useChatStore, type ChatMessage } from "@/lib/chat-store";

*** Add File: src/hooks/use-stream.ts
import { useCallback, useRef, useState } from "react";

/**
 * Minimal SSE reader for streaming chat responses.
 * Reconnects on transient network failure with capped backoff.
 */
export function useStream() {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const start = useCallback(
    async (url: string, body: unknown, onToken: (t: string) => void, onDone?: () => void) => {
      stop();
      const ac = new AbortController();
      abortRef.current = ac;
      setStreaming(true);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ac.signal,
        });
        if (!res.body) throw new Error("no stream body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload) as { text?: string };
              if (parsed.text) onToken(parsed.text);
            } catch {
              // Ignore non-JSON frames
            }
          }
        }
        onDone?.();
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [stop],
  );

  return { start, stop, streaming };
}

*** Add File: src/hooks/use-chat-history.ts
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

*** Add File: src/hooks/use-memory.ts
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

*** Add File: src/hooks/use-journey.ts
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

*** Add File: src/hooks/use-streak.ts
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

*** Add File: src/hooks/use-achievements.ts
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

*** Add File: src/hooks/use-premium.ts
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

*** Add File: src/hooks/use-documents.ts
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type UserDocument = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  updated_at: string;
};

export function useDocuments() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setDocs(data as UserDocument[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async (doc: Omit<UserDocument, "id" | "user_id" | "updated_at">) => {
    if (!user) return null;
    const { data } = await supabase
      .from("user_documents")
      .insert({ user_id: user.id, ...doc })
      .select("*")
      .single();
    if (data) setDocs((d) => [data as UserDocument, ...d]);
    return data as UserDocument | null;
  }, [user]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("user_documents").delete().eq("id", id);
    setDocs((d) => d.filter((x) => x.id !== id));
  }, []);

  return { docs, loading, save, remove, reload: load };
}

*** Add File: src/hooks/use-discover-feed.ts
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

*** Add File: src/hooks/use-think-deeper.ts
import { useUIStore } from "@/store/ui-store";

/**
 * Think Deeper — the 悠 mode. When enabled, the chat request asks the
 * orchestrator for a more deliberate, structured answer with rich response
 * shaping and richer memory injection.
 */
export function useThinkDeeper() {
  const on = useUIStore((s) => s.thinkDeeper);
  const set = useUIStore((s) => s.setThinkDeeper);
  return { on, toggle: () => set(!on), set };
}
