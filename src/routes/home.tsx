import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DiscoverPanel } from "@/components/DiscoverPanel";
import { Paperclip, Globe, Sparkles, Image as ImageIcon, ArrowUp, Plane, GraduationCap, MapPin, Briefcase, Building2, Scale, ChevronRight, ArrowDown, Check } from "lucide-react";
import fuji from "@/assets/fuji-hero.jpg";
import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({ component: Home });

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
  const navigate = useNavigate();
  const { setPendingPrompt, reset } = useChatStore();
  const { user } = useAuth();
  const displayName =
    (user?.user_metadata as { full_name?: string } | null)?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "friend";

  const go = (text: string) => {
    reset();
    setPendingPrompt(text);
    void navigate({ to: "/chat" });
  };

  return (
    <AppShell rightPanel={<DiscoverPanel />}>
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <img
            src={fuji}
            alt="Mount Fuji with cherry blossoms"
            className="h-[280px] w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8">
            <p className="text-sm text-muted-foreground">こんにちは、{displayName}! 👋</p>
            <h1 className="mt-2 text-5xl font-bold tracking-tight">Ask Yuki anything.</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">Your AI guide that knows Japan inside and out.</p>
          </div>
        </div>

        <div className="relative mt-6">
          <form
            onSubmit={(e) => { e.preventDefault(); if (input.trim()) go(input); }}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur p-4 shadow-sm"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Yuki anything..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground py-2"
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Chip icon={<Paperclip className="h-3 w-3" />}>Attach</Chip>
                <Chip icon={<Globe className="h-3 w-3" />}>Web Search</Chip>
                <Chip icon={<Sparkles className="h-3 w-3" />}>Think Deeper</Chip>
                <Chip icon={<ImageIcon className="h-3 w-3" />}>Image</Chip>
              </div>
              <button type="submit" className="rounded-full bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 transition">
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {SUGGESTIONS.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => go(label)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium hover:bg-accent/40 transition"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </button>
            ))}
          </div>

          <h2 className="mt-10 text-sm font-semibold">Continue your journey</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <JourneyCard title="Moving to Japan in 2028" sub="Your personalized roadmap" tag="60% complete" tone="from-sky-100 to-indigo-100" />
            <JourneyCard title="Learn Japanese" sub="Daily practice" tag="Streak: 12 days 🔥" tone="from-rose-100 to-pink-100" bigChar="あ" />
            <JourneyCard title="Kyoto 7-day itinerary" sub="Saved itinerary" tone="from-emerald-50 to-teal-100" />
            <JourneyCard title="Japanese Resume Guide" sub="Step-by-step with examples" tone="from-slate-100 to-slate-200" check />
          </div>

          <h2 className="mt-10 text-sm font-semibold">Ask anything. Yuki can help with:</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {HELP.map((h) => (
              <div key={h.title} className="rounded-xl border border-border bg-card p-3">
                <div className="text-lg">{h.icon}</div>
                <p className="mt-2 text-xs font-semibold">{h.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-full border border-border bg-card p-1.5"><ArrowDown className="h-3.5 w-3.5 text-muted-foreground" /></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Chip({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent/40">
      {icon}
      {children}
    </button>
  );
}

function JourneyCard({ title, sub, tag, tone, bigChar, check }: { title: string; sub: string; tag?: string; tone: string; bigChar?: string; check?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${tone} p-4 h-44 flex flex-col`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
      {tag && <p className="mt-3 text-xs font-medium">{tag}</p>}
      {bigChar && <div className="absolute bottom-2 right-3 text-5xl font-bold text-rose-400/70">{bigChar}</div>}
      {check && <div className="absolute bottom-3 right-3 rounded-full bg-emerald-500 p-1 text-white"><Check className="h-3 w-3" /></div>}
      <button className="absolute bottom-3 left-3 rounded-full bg-white/80 backdrop-blur p-1.5"><ChevronRight className="h-3 w-3" /></button>
    </div>
  );
}
