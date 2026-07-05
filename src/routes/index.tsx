import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, BookOpen, ShieldCheck, Sparkles, Sun, Moon, ArrowUp,
  Compass, MapPin, CheckCircle2, Check,
} from "lucide-react";
import fuji from "@/assets/fuji-hero.jpg";
import logo from "@/assets/yuki-logo.png.asset.json";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Yuki — Your AI companion for Japan" },
      { name: "description", content: "Yuki answers your questions, helps you plan trips, learn Japanese, and discover the best of Japan." },
      { property: "og:title", content: "Yuki — Your AI companion for Japan" },
      { property: "og:description", content: "Plan trips, learn Japanese, and discover Japan with Yuki AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setPendingPrompt, reset } = useChatStore();
  const [dark, setDark] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const start = () => {
    if (user) void navigate({ to: "/home" });
    else void navigate({ to: "/auth" });
  };

  const startWith = (t: string) => {
    if (!user) return void navigate({ to: "/auth" });
    reset();
    setPendingPrompt(t);
    void navigate({ to: "/chat" });
  };

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo.url} alt="Yuki" className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight">yuki</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#usecases" className="hover:text-foreground">Use cases</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#blog" className="hover:text-foreground">Blog</a>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => setDark((v) => !v)} className="rounded-full p-2 text-muted-foreground hover:bg-accent/40" aria-label="Toggle theme">
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Log in</Link>
          <button onClick={start} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition">
            Get started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:pb-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-indigo-500">
              <Sparkles className="h-3 w-3" /> Your AI companion for Japan
            </span>
            <h1 className="mt-5 font-serif text-6xl leading-[1.02] tracking-tight">
              Explore Japan.<br />
              The <span className="italic font-medium text-indigo-500">smart</span> way.
            </h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground">
              Yuki answers your questions, helps you plan trips, learn Japanese, and discover the best of Japan.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={start} className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-600 transition">
                Start chatting for free
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-3 text-sm font-medium hover:bg-accent/40">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-white text-[10px]">▶</span>
                See how it works
              </button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <TrustPill icon={<Sparkles className="h-3.5 w-3.5" />} label="AI with local insights" />
              <TrustPill icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Up-to-date & reliable" />
              <TrustPill icon={<Check className="h-3.5 w-3.5" />} label="Made for Japan lovers" />
            </div>
          </div>

          {/* Chat card + fuji */}
          <div className="relative">
            <div className="pointer-events-none absolute -right-16 -top-6 h-[420px] w-[560px] overflow-hidden rounded-3xl">
              <img src={fuji} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white" />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={logo.url} alt="" className="h-8 w-8" />
                  <div>
                    <p className="text-sm font-semibold">Yuki AI</p>
                    <p className="flex items-center gap-1 text-[11px] text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online</p>
                  </div>
                </div>
                <span className="text-muted-foreground">···</span>
              </div>
              <p className="mt-4 text-sm">Hello! I'm Yuki 🌸</p>
              <p className="text-sm">How can I help you today?</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Plan a 5-day trip to Kyoto", "Best time to see autumn leaves", "Learn Japanese basics", "Hidden gems in Tokyo"].map((s) => (
                  <button key={s} onClick={() => startWith(s)} className="rounded-full border border-border px-3 py-1.5 text-[11px] hover:bg-accent/40">
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); if (input.trim()) startWith(input); }}
                className="mt-4 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Yuki anything..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="rounded-full bg-indigo-500 p-1.5 text-white"><ArrowUp className="h-3.5 w-3.5" /></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center font-serif text-3xl">Everything you need, in one place</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          <FeatureCard icon={<Briefcase className="h-5 w-5" />} title="Plan trips" desc="Get personalized itineraries and travel tips that fit your style and budget." tone="bg-indigo-50 text-indigo-500" />
          <FeatureCard icon={<BookOpen className="h-5 w-5" />} title="Learn Japanese" desc="From simple phrases to grammar, Yuki makes learning easy and fun." tone="bg-emerald-50 text-emerald-600" />
          <FeatureCard icon={<Compass className="h-5 w-5" />} title="Discover Japan" desc="Find hidden gems, local experiences, and cultural insights." tone="bg-rose-50 text-rose-500" />
          <FeatureCard icon={<MapPin className="h-5 w-5" />} title="Find food & more" desc="Discover great restaurants, cafés, and things to do around you." tone="bg-amber-50 text-amber-600" />
          <FeatureCard icon={<ShieldCheck className="h-5 w-5" />} title="Get reliable answers" desc="Accurate, up-to-date information you can always trust." tone="bg-sky-50 text-sky-500" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center font-serif text-3xl">How Yuki works</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step n={1} title="Ask anything" desc="Type your question in natural language." />
          <Step n={2} title="Get smart answers" desc="Yuki searches, thinks, and gives you clear, helpful answers." />
          <Step n={3} title="Take action" desc="Save chats, build itineraries, and come back anytime." />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 p-10 md:flex md:items-center md:justify-between">
          <div>
            <h3 className="font-serif text-3xl">Ready to explore Japan with Yuki?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Your next adventure starts with a question.</p>
          </div>
          <button onClick={start} className="mt-5 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-600 md:mt-0">
            Start chatting for free ✨
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <img src={logo.url} alt="Yuki" className="h-8 w-8" />
              <span className="text-lg font-semibold">yuki</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground max-w-xs">Your AI companion for everything Japan.</p>
          </div>
          <FooterCol title="Product" items={["Features", "Use cases", "Pricing"]} />
          <FooterCol title="Resources" items={["Blog", "Guides", "Help center"]} />
          <FooterCol title="Company" items={["About", "Contact"]} />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-[11px] text-muted-foreground">
            <span>© {new Date().getFullYear()} Yuki AI. All rights reserved.</span>
            <div className="flex gap-4"><span>Privacy</span><span>Terms</span><span>Security</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-indigo-500">{icon}</div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc, tone }: { icon: React.ReactNode; title: string; desc: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 text-center">
      <div className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${tone}`}>{icon}</div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div>
      <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-500">{n}</div>
      <p className="mt-3 text-base font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold">{title}</p>
      <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}