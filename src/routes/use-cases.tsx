import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plane, GraduationCap, Briefcase, Home as HomeIcon, Languages, Heart } from "lucide-react";
import logo from "@/assets/yuki-logo.png";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/use-cases")({
  component: UseCases,
  head: () => ({
    meta: [
      { title: "Use cases · Yuki — Real Japan questions, better answered" },
      { name: "description", content: "How travelers, JLPT learners, engineers moving to Tokyo, and long-term residents use Yuki as their daily Japan companion." },
      { property: "og:title", content: "Use cases · Yuki" },
      { property: "og:description", content: "Real stories, real questions — the way Yuki is used in practice." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function UseCases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reset, setPendingPrompt } = useChatStore();
  const start = () => void navigate({ to: user ? "/home" : "/auth" });
  const go = (t: string) => {
    if (!user) return void navigate({ to: "/auth" });
    reset(); setPendingPrompt(t); void navigate({ to: "/chat" });
  };

  return (
    <div className="min-h-screen bg-[var(--washi)] font-sans text-foreground antialiased">
      <Header onStart={start} />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 pt-24 pb-20">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Use cases · 事例</p>
          <h1 className="mt-6 max-w-4xl font-serif text-[76px] leading-[1] tracking-[-0.02em] text-[var(--sumi)]">
            Six people. Six <em className="italic text-[var(--shu)]">Japans</em>. One companion.
          </h1>
          <p className="mt-8 max-w-xl text-[15px] leading-[1.7] text-muted-foreground">
            The clearest way to see what Yuki is for is to watch it work on a real question.
            Below are six unedited scenarios drawn from actual sessions.
          </p>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 py-20 space-y-24">
          <Case n="01" icon={<Plane />} persona="Aiko · First-time traveler" location="Sydney → Kyoto, November"
            prompt="Plan a 7-day Kansai loop that doesn't miss Nara but stays under ¥120,000."
            outcome="Yuki drafted a day-by-day route with JR pass math, ryokan holds in Higashiyama, an Arashiyama momiji-peak morning, and an Osaka izakaya night. Two follow-up messages tuned it around a bad-knee constraint."
            metric="7-day plan · ¥118,400 · 3 rewrites · 11 minutes"
            onTry={() => go("Plan a 7-day Kansai loop that doesn't miss Nara but stays under ¥120,000.")}
          />
          <Case n="02" icon={<Languages />} persona="Marco · JLPT N4 learner" location="Milan · 2 years studying"
            prompt="I keep confusing に and で. Can you drill me until I stop?"
            outcome="Yuki opened with the core rule, ran a 12-question mini-quiz inline, marked what Marco missed, and stored the pattern in memory so it revisits the same points next week without being asked."
            metric="Memory: 3 grammar points tracked · N4 → N3 track active"
            onTry={() => go("I'm JLPT N4 and I keep confusing に and で. Quiz me.")}
          />
          <Case n="03" icon={<Briefcase />} persona="Priya · Backend engineer" location="Bangalore → Tokyo, 2028"
            prompt="I want to move to Tokyo in 2028 as a backend engineer. Build me the roadmap."
            outcome="Yuki generated a milestone timeline — JLPT N3 by Q2 2027, SES-friendly agencies shortlisted, Setagaya-vs-Suginami rent comparison, savings runway to ¥1.8M. The roadmap lives in her library and updates as she checks off milestones."
            metric="Roadmap: 14 milestones · 22 months · saved to library"
            onTry={() => go("I want to move to Tokyo in 2028 as a backend engineer. Build me the roadmap.")}
          />
          <Case n="04" icon={<GraduationCap />} persona="Jun-ho · Prospective student" location="Seoul · MEXT applicant"
            prompt="Compare MEXT and Japanese-government-adjacent scholarships for a CS masters."
            outcome="Yuki produced a side-by-side of MEXT-Embassy, MEXT-University, ADB-JSP, and Panasonic Scholarship — stipend, coverage, language requirement, application window, past-year acceptance signal."
            metric="4 programs compared · 6 disqualifiers flagged"
            onTry={() => go("Compare MEXT and adjacent scholarships for a CS masters in Japan.")}
          />
          <Case n="05" icon={<HomeIcon />} persona="Sam · Just landed" location="Nakano, Tokyo · week 1"
            prompt="How do I actually set up my life this week? Hanko, bank, phone, my-number."
            outcome="Yuki produced a five-day ordered checklist with ward-office hours, which bank accepts residence card same-day, phone plans without a Japanese credit card, and where to order a hanko in Nakano."
            metric="5-day setup · 12 tasks · saved as document"
            onTry={() => go("I just moved to Nakano. How do I set up hanko, bank, phone, and my-number this week?")}
          />
          <Case n="06" icon={<Heart />} persona="Elena · Long-term resident" location="Fukuoka · 4 years"
            prompt="Draft a formal email declining a client meeting without offending them."
            outcome="Yuki wrote it in full keigo, explained each honorific choice line-by-line, and offered a slightly warmer alternative for an existing client vs a cold introduction."
            metric="Register: 敬語 · line-by-line rationale · 2 variants"
            onTry={() => go("Draft a formal Japanese email declining a client meeting politely.")}
          />
        </div>
      </section>

      {/* Personas by intent */}
      <section className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Who is Yuki for?</p>
          <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1] tracking-tight text-[var(--sumi)]">Written for the people actually going.</h2>

          <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3">
            {[
              ["Travelers", "Season-tuned itineraries that respect budget, mobility, and taste."],
              ["Language learners", "Graded practice that remembers what you already know."],
              ["Job seekers", "Visa timelines, rirekisho, and recruiter-ready keigo."],
              ["Students", "Scholarships, language schools, dorm rules, part-time limits."],
              ["New arrivals", "Hanko, my-number, ward office, garbage rules — day-by-day."],
              ["Long-term residents", "Legal Japanese, formal email, kids' school, tax quirks."],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-[var(--sumi)] pt-5">
                <p className="font-serif text-2xl text-[var(--sumi)]">{t}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <div className="relative overflow-hidden border border-border bg-[var(--sumi)] p-14 text-white md:p-20">
            <div className="absolute right-8 top-8 font-serif text-7xl italic text-white/10">事</div>
            <h3 className="max-w-2xl font-serif text-5xl leading-[1] tracking-tight md:text-6xl">Your Japan story starts with a question.</h3>
            <button onClick={start} className="mt-10 inline-flex items-center gap-2 bg-[var(--shu)] px-7 py-4 text-[13px] font-medium tracking-wide text-white hover:bg-white hover:text-[var(--sumi)] transition">
              Start chatting <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Header({ onStart }: { onStart: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[var(--washi)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-8 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo.url} alt="Yuki" className="h-7 w-7" />
          <span className="font-serif text-xl italic tracking-tight text-[var(--sumi)]">yuki<span className="text-[var(--shu)]">.</span></span>
        </Link>
        <nav className="hidden items-center gap-10 text-[13px] tracking-wide text-muted-foreground md:flex">
          <Link to="/features" className="hover:text-foreground">Features</Link>
          <Link to="/use-cases" className="text-foreground">Use cases</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="hidden text-[13px] tracking-wide text-muted-foreground hover:text-foreground md:inline">Log in</Link>
          <button onClick={onStart} className="bg-[var(--sumi)] px-5 py-2.5 text-[12px] font-medium tracking-wide text-white hover:bg-[var(--shu)] transition">Get started</button>
        </div>
      </div>
    </header>
  );
}

function Case({ n, icon, persona, location, prompt, outcome, metric, onTry }: {
  n: string; icon: React.ReactNode; persona: string; location: string; prompt: string; outcome: string; metric: string; onTry: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.35fr_1fr]">
      <div className="border-t border-[var(--sumi)] pt-5">
        <p className="font-serif text-sm italic text-muted-foreground">{n}</p>
        <div className="mt-3 text-[var(--shu)]">{icon}</div>
        <p className="mt-4 font-serif text-xl text-[var(--sumi)]">{persona}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{location}</p>
      </div>
      <div className="border-t border-border pt-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Prompt</p>
        <p className="mt-3 font-serif text-2xl leading-[1.25] text-[var(--sumi)]">&ldquo;{prompt}&rdquo;</p>
        <p className="mt-6 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Outcome</p>
        <p className="mt-3 text-[14px] leading-[1.75] text-muted-foreground">{outcome}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--shu)]">{metric}</p>
          <button onClick={onTry} className="inline-flex items-center gap-2 text-[12px] tracking-wide text-[var(--sumi)] underline underline-offset-[6px] decoration-[var(--shu)]">
            Try this prompt <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-8 py-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <span>© {new Date().getFullYear()} Yuki AI · 東京</span>
        <div className="flex gap-8"><Link to="/features">Features</Link><Link to="/use-cases">Use cases</Link></div>
      </div>
    </footer>
  );
}