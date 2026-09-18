import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, BookOpen, ShieldCheck, Sparkles, Sun, Moon, ArrowUp,
  Compass, MapPin, ArrowRight, Plane, GraduationCap, Building2,
} from "lucide-react";
import fuji from "@/assets/fuji-hero.jpg";
import logo from "@/assets/yuki-logo.png";
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
    <div className="min-h-screen bg-[var(--washi)] text-foreground font-sans antialiased">
      <SiteHeader dark={dark} setDark={setDark} onStart={start} />

      {/* HERO — editorial split */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-16 px-8 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="relative">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-[var(--shu)]" />
              <span>Japan-specialist AI</span>
            </div>

            <h1 className="mt-8 font-serif text-[76px] leading-[0.98] tracking-[-0.02em] text-[var(--sumi)] md:text-[92px]">
              A quiet, careful<br />
              guide to <em className="italic text-[var(--shu)]">Japan</em>.
            </h1>

            <p className="mt-8 max-w-[440px] text-[15px] leading-[1.65] text-muted-foreground">
              Yuki is trained on the parts of Japan a general chatbot skips —
              honorific register, visa timelines, JLPT tracks, seasonal travel,
              and the rhythm of daily life. Ask once. Get answers a resident would give.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={start}
                className="group inline-flex items-center gap-2 rounded-none bg-[var(--sumi)] px-7 py-4 text-[13px] font-medium tracking-wide text-white transition hover:bg-[var(--shu)]"
              >
                Start with Yuki
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </button>
              <Link to="/features" className="text-[13px] tracking-wide text-muted-foreground underline underline-offset-[6px] decoration-[var(--shu)] hover:text-foreground">
                See what Yuki can do
              </Link>
            </div>

            {/* Metrics strip */}
            <div className="mt-16 grid max-w-[520px] grid-cols-3 gap-8 border-t border-border pt-8">
              <Metric num="47" unit="prefectures" label="covered offline" />
              <Metric num="3" unit="registers" label="keigo · desu-masu · casual" />
              <Metric num="< 400ms" unit="" label="first token latency" />
            </div>
          </div>

          {/* Right: Fuji plate + chat card */}
          <div className="relative">
            <div className="relative overflow-hidden">
              <img src={fuji} alt="Mount Fuji under sakura" className="h-[520px] w-full object-cover grayscale-[0.15]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--washi)] via-transparent to-transparent" />
              <div className="absolute left-6 top-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/90 mix-blend-difference">
                <span className="h-px w-6 bg-white/70" /> 富士 · fuji-san
              </div>
              <div className="absolute bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-[var(--shu)] font-serif text-2xl italic text-white shadow-lg">雪</div>
            </div>

            {/* Floating chat card */}
            <div className="absolute -bottom-10 -left-10 z-10 hidden w-[380px] rounded-sm border border-border bg-white p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] md:block">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--sumi)] font-serif text-xs italic text-white">Y</div>
                <div>
                  <p className="text-[12px] font-medium tracking-wide">Yuki</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Online · JP time</p>
                </div>
              </div>
              <p className="mt-4 font-serif text-[17px] leading-snug text-[var(--sumi)]">
                こんにちは。<br />
                <span className="text-muted-foreground italic">How can I help you today?</span>
              </p>
              <form
                onSubmit={(e) => { e.preventDefault(); if (input.trim()) startWith(input); }}
                className="mt-4 flex items-center gap-2 border-t border-border pt-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about visas, Kyoto, keigo…"
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" className="grid h-8 w-8 place-items-center rounded-full bg-[var(--shu)] text-white hover:bg-[var(--sumi)] transition"><ArrowUp className="h-3.5 w-3.5" /></button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF — logos / stats bar */}
      <section className="border-b border-border/60 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-8 py-6 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Built for the Japanese market</span>
          <span>· Keigo-aware ·</span>
          <span>· JLPT N5 → N1 ·</span>
          <span>· Visa timelines ·</span>
          <span>· Seasonal travel ·</span>
          <span>· Work culture ·</span>
        </div>
      </section>

      {/* CAPABILITIES — grid of six */}
      <section id="features" className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Capabilities</p>
              <h2 className="mt-4 font-serif text-5xl leading-[1] tracking-tight text-[var(--sumi)]">Six directions, one companion.</h2>
            </div>
            <Link to="/features" className="hidden text-[13px] tracking-wide text-muted-foreground underline underline-offset-[6px] decoration-[var(--shu)] hover:text-foreground md:inline">All features →</Link>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-px bg-border md:grid-cols-3">
            <Cap n="01" icon={<Plane className="h-5 w-5" />} title="Travel &amp; Places" desc="Itineraries by season, sub-region routing, temple etiquette, hidden ryokans, JR pass math." />
            <Cap n="02" icon={<BookOpen className="h-5 w-5" />} title="Language" desc="Grammar with real examples, kanji breakdowns, N5→N1 study tracks, honorific switching." />
            <Cap n="03" icon={<Briefcase className="h-5 w-5" />} title="Career" desc="Rirekisho drafting, engineer visa timelines, salary bands by prefecture, agency shortlists." />
            <Cap n="04" icon={<GraduationCap className="h-5 w-5" />} title="Study" desc="MEXT & private scholarships, language school picks, dorm rules, part-time work limits." />
            <Cap n="05" icon={<Building2 className="h-5 w-5" />} title="Living" desc="Ward-by-ward rent, hanko &amp; my-number, health insurance, phone plans, garbage rules." />
            <Cap n="06" icon={<Compass className="h-5 w-5" />} title="Culture" desc="Festivals week-by-week, tea ceremony basics, business-card ritual, senpai / kōhai dynamics." />
          </div>
        </div>
      </section>

      {/* USE CASES — editorial three column */}
      <section id="usecases" className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Use cases</p>
          <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-[1] tracking-tight text-[var(--sumi)]">
            Written for the people <em className="italic text-[var(--shu)]">actually</em> going.
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-14 md:grid-cols-3">
            <UseCase
              tag="First-time traveler"
              quote="Plan a 7-day Kansai loop that doesn't miss Nara but stays under ¥120,000."
              body="Yuki drafts a day-by-day route with train times, ryokan holds, and seasonal calls (autumn leaves peak in Arashiyama around Nov 18)."
            />
            <UseCase
              tag="Language learner"
              quote="I'm N4 and I keep confusing に and で."
              body="Yuki teaches with side-by-side examples, quizzes you inline, and remembers the grammar points you've mastered across sessions."
            />
            <UseCase
              tag="Moving to Japan"
              quote="I want to move to Tokyo in 2028 as a backend engineer."
              body="Yuki builds a personalised roadmap — JLPT target, visa track, savings runway, prefecture comparison — and revisits it as your goals shift."
            />
          </div>

          <div className="mt-12">
            <Link to="/use-cases" className="inline-flex items-center gap-2 text-[13px] tracking-wide text-[var(--sumi)] underline underline-offset-[6px] decoration-[var(--shu)]">
              Read the full case studies <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY — big serif quote */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 py-28">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_2fr]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Philosophy</p>
            <div>
              <p className="font-serif text-4xl leading-[1.15] text-[var(--sumi)] md:text-5xl">
                &ldquo;A general chatbot answers <em className="italic">how do I move to Japan</em> with
                a Wikipedia summary. Yuki answers with a year-by-year roadmap,
                references your saved goals, and shifts to keigo when a recruiter
                will read it.&rdquo;
              </p>
              <p className="mt-8 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Design principle · 一 · scope over surface</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <div className="relative overflow-hidden border border-border bg-[var(--sumi)] p-14 text-white md:p-20">
            <div className="absolute right-8 top-8 font-serif text-7xl italic text-white/10">雪</div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Begin</p>
            <h3 className="mt-3 max-w-2xl font-serif text-5xl leading-[1] tracking-tight md:text-6xl">
              Your Japan questions deserve better answers.
            </h3>
            <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-white/70">
              Free to start. No credit card. Yuki remembers what you're working toward.
            </p>
            <button
              onClick={start}
              className="mt-10 inline-flex items-center gap-2 rounded-none bg-[var(--shu)] px-7 py-4 text-[13px] font-medium tracking-wide text-white hover:bg-white hover:text-[var(--sumi)] transition"
            >
              Start chatting <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SiteHeader({ dark, setDark, onStart }: { dark: boolean; setDark: (v: boolean | ((p: boolean) => boolean)) => void; onStart: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[var(--washi)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Yuki" className="h-7 w-7" />
          <span className="font-serif text-xl italic tracking-tight text-[var(--sumi)]">yuki<span className="text-[var(--shu)]">.</span></span>
        </Link>
        <nav className="hidden items-center gap-10 text-[13px] tracking-wide text-muted-foreground md:flex">
          <Link to="/features" className="hover:text-foreground">Features</Link>
          <Link to="/use-cases" className="hover:text-foreground">Use cases</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => setDark((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/auth" className="hidden text-[13px] tracking-wide text-muted-foreground hover:text-foreground md:inline">Log in</Link>
          <button onClick={onStart} className="rounded-none bg-[var(--sumi)] px-5 py-2.5 text-[12px] font-medium tracking-wide text-white hover:bg-[var(--shu)] transition">
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}

function Metric({ num, unit, label }: { num: string; unit?: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl leading-none text-[var(--sumi)]">{num}<span className="ml-1 text-sm text-muted-foreground">{unit}</span></p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  );
}

function Cap({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative bg-[var(--washi)] p-8 transition hover:bg-white">
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center border border-border bg-white text-[var(--shu)] transition group-hover:bg-[var(--shu)] group-hover:text-white">{icon}</div>
        <span className="font-serif text-sm italic text-muted-foreground">{n}</span>
      </div>
      <p className="mt-8 font-serif text-2xl text-[var(--sumi)]">{title}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function UseCase({ tag, quote, body }: { tag: string; quote: string; body: string }) {
  return (
    <div className="border-t border-[var(--sumi)] pt-6">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--shu)]">{tag}</p>
      <p className="mt-6 font-serif text-2xl leading-[1.25] text-[var(--sumi)]">&ldquo;{quote}&rdquo;</p>
      <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-10 px-8 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Yuki" className="h-7 w-7" />
            <span className="font-serif text-xl italic text-[var(--sumi)]">yuki<span className="text-[var(--shu)]">.</span></span>
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            A quiet, careful AI companion for Japan. Built for travelers, learners, and anyone considering a life here.
          </p>
        </div>
        <FooterCol title="Product" items={[{ label: "Features", to: "/features" }, { label: "Use cases", to: "/use-cases" }]} />
        <FooterCol title="Account" items={[{ label: "Log in", to: "/auth" }, { label: "Sign up", to: "/auth" }]} />
        <FooterCol title="Company" items={[{ label: "About", to: "/" }, { label: "Contact", to: "/" }]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-8 py-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>© {new Date().getFullYear()} Yuki AI · 東京</span>
          <span>Privacy · Terms</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--sumi)]">{title}</p>
      <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
        {items.map((i) => <li key={i.label}><Link to={i.to} className="hover:text-foreground">{i.label}</Link></li>)}
      </ul>
    </div>
  );
}