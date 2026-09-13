import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Briefcase,
  Building2,
  Clock3,
  Globe,
  GraduationCap,
  MapPin,
  MessageSquare,
  Paperclip,
  Plane,
  Scale,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import fuji from "@/assets/fuji-hero.jpg";
import { useChatStore } from "@/lib/chat-store";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home | Yuki AI" },
      { name: "description", content: "Ask Yuki about Japan and continue your recent journeys." },
      { property: "og:title", content: "Home | Yuki AI" },
      { property: "og:description", content: "Your personalized home for exploring Japan with Yuki AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type RecentConversation = { id: string; title: string | null; created_at: string | null };

const SUGGESTIONS = [
  { icon: Plane, label: "I want to move to Japan in 2028" },
  { icon: GraduationCap, label: "Teach me Japanese" },
  { icon: MapPin, label: "Plan a perfect trip to Kyoto" },
  { icon: Briefcase, label: "How to get a job in Japan" },
  { icon: Building2, label: "Compare living in Tokyo vs Osaka" },
  { icon: Scale, label: "Explain Japanese work culture" },
];

const HELP = [
  { icon: "✈️", title: "Travel & Places", desc: "Itineraries, local tips, hidden gems" },
  { icon: "📚", title: "Language Learning", desc: "Lessons, grammar, conversation practice" },
  { icon: "💼", title: "Jobs & Career", desc: "Job search, resume, interview prep" },
  { icon: "🎓", title: "Studying in Japan", desc: "Universities, visas, scholarships" },
  { icon: "🏠", title: "Living in Japan", desc: "Housing, banking, daily life" },
  { icon: "🏢", title: "Business", desc: "Start a business, market research" },
];

function Home() {
  const [input, setInput] = useState("");
  const [recent, setRecent] = useState<RecentConversation[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const navigate = useNavigate();
  const { setPendingPrompt, setConversation, setMessages, reset } = useChatStore();
  const { user } = useAuth();
  const { profile } = useProfile();
  const displayName =
    profile?.full_name?.split(" ")[0] ||
    (user?.user_metadata as { full_name?: string } | null)?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "friend";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) console.error("[Home] recent journeys error", error);
      if (!cancelled) {
        setRecent(data ?? []);
        setLoadingRecent(false);
      }
    };
    void load();
    const channel = supabase
      .channel(`home-journeys-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const go = (text: string) => {
    reset();
    setPendingPrompt(text);
    void navigate({ to: "/chat" });
  };

  const continueConversation = (id: string) => {
    setMessages([]);
    setConversation(id);
    void navigate({ to: "/chat" });
  };

  return (
    <AppShell>
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <img src={fuji} alt="Mount Fuji with cherry blossoms" className="h-[280px] w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
            <p className="text-sm text-muted-foreground">こんにちは、{displayName}! 👋</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Ask Yuki anything.</h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">Your AI guide that knows Japan inside and out.</p>
          </div>
        </div>

        <div className="relative mt-6">
          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) go(input); }} className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Yuki anything..." className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground" />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Chip icon={<Paperclip className="h-3 w-3" />}>Attach</Chip>
                <Chip icon={<Globe className="h-3 w-3" />}>Web Search</Chip>
              </div>
              <button type="submit" aria-label="Send to Yuki" className="cursor-pointer rounded-full bg-primary p-2.5 text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0">
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {SUGGESTIONS.map(({ icon: Icon, label }) => (
              <button key={label} onClick={() => go(label)} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium transition hover:-translate-y-0.5 hover:bg-accent/40 hover:shadow-sm">
                <Icon className="h-3.5 w-3.5 text-primary" />{label}
              </button>
            ))}
          </div>

          <div className="mt-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Continue your journey</h2>
              <p className="mt-1 text-xs text-muted-foreground">Your latest conversations with Yuki.</p>
            </div>
            {recent.length > 0 && <button onClick={() => void navigate({ to: "/history" })} className="cursor-pointer text-xs font-medium text-primary hover:underline">View all</button>}
          </div>
          {loadingRecent ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-xl border border-border bg-muted" />)}
            </div>
          ) : recent.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recent.map((conversation) => <JourneyCard key={conversation.id} conversation={conversation} onOpen={() => continueConversation(conversation.id)} />)}
            </div>
          ) : (
            <button onClick={() => void navigate({ to: "/chat" })} className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-xl border border-dashed border-border bg-card px-5 py-5 text-left transition hover:border-primary/40 hover:bg-accent/20">
              <span><span className="block text-sm font-medium">Your first journey starts here</span><span className="mt-1 block text-xs text-muted-foreground">Ask Yuki a question and it will appear here automatically.</span></span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </button>
          )}

          <h2 className="mt-10 text-sm font-semibold">Ask anything. Yuki can help with:</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {HELP.map((h) => <div key={h.title} className="rounded-xl border border-border bg-card p-3"><div className="text-lg">{h.icon}</div><p className="mt-2 text-xs font-semibold">{h.title}</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{h.desc}</p></div>)}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Chip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return <button type="button" className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground transition hover:bg-accent/40">{icon}{children}</button>;
}

function JourneyCard({ conversation, onOpen }: { conversation: RecentConversation; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group flex h-36 cursor-pointer flex-col rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary"><MessageSquare className="h-4 w-4" /></span>
      <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{conversation.title?.trim() || "Untitled conversation"}</span>
      <span className="mt-auto flex w-full items-center justify-between text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{formatWhen(conversation.created_at)}</span><ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
    </button>
  );
}

function formatWhen(iso: string | null) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}