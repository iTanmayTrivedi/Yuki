import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plane, BookOpen, Briefcase, GraduationCap, Building2, Compass, Shield, Brain, MessageSquare, Sparkles, Clock, Languages, Database, Zap } from "lucide-react";
import logo from "@/assets/yuki-logo.png";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/features")({
  component: Features,
  head: () => ({
    meta: [
      { title: "Features · Yuki — A Japan-specialist AI companion" },
      { name: "description", content: "What Yuki does differently: keigo-aware honorifics, per-user memory, structured roadmaps, scope-guarded answers, and a JLPT-graded study track." },
      { property: "og:title", content: "Features · Yuki" },
      { property: "og:description", content: "Every capability that makes Yuki a Japan specialist, not a general chatbot." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function Features() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const start = () => void navigate({ to: user ? "/home" : "/auth" });

  return (
    <div className="min-h-screen bg-[var(--washi)] font-sans text-foreground antialiased">
      <Header onStart={start} />

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 pt-24 pb-20">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Features · 機能</p>
          <h1 className="mt-6 max-w-4xl font-serif text-[76px] leading-[1] tracking-[-0.02em] text-[var(--sumi)]">
            The parts a general chatbot <em className="italic text-[var(--shu)]">quietly</em> gets wrong.
          </h1>
          <p className="mt-8 max-w-xl text-[15px] leading-[1.7] text-muted-foreground">
            Yuki isn&apos;t a wrapper with a prompt. It&apos;s six coordinated systems built specifically for
            questions about Japan — the register you speak in, the memory of what you&apos;re working toward,
            the shape of the answer you actually need.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-border/60 bg-white">
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
            <Pillar n="01" icon={<Shield />} title="Scope guard" tag="Trust boundary"
              body="Every query is checked against a hard Japan boundary before it hits the model. Off-topic asks are politely declined — your credits and latency never leak on tangents." />
            <Pillar n="02" icon={<Brain />} title="Per-user memory" tag="Continuity"
              body="Yuki remembers your target city, JLPT level, timeline, and dietary needs across sessions — pulled from a private, RLS-scoped table injected into every prompt." />
            <Pillar n="03" icon={<Languages />} title="Honorific register" tag="Keigo / 敬語"
              body="Toggle between casual, desu-masu, and full keigo. Yuki adjusts particles, verb endings, and vocabulary — the same idea, said the way a Japanese recruiter reads it." />
            <Pillar n="04" icon={<Database />} title="Structured responses" tag="Not paragraphs"
              body="Roadmaps render as timelines. Itineraries render as day cards. Grammar renders as side-by-side examples. The model returns typed JSON; the UI renders it as first-class objects." />
            <Pillar n="05" icon={<MessageSquare />} title="Intent classifier" tag="Router"
              body="Every message is routed — visa, language, travel, career, culture — and shaped by an intent-specific system prompt so answers land in the right register and depth." />
            <Pillar n="06" icon={<Zap />} title="Token optimiser" tag="Latency"
              body="Kanji is ~3× denser than English; Yuki exploits that and compresses history aggressively. First token in under 400ms on a warm session." />
          </div>
        </div>
      </section>

      {/* Domain grid */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Six domains · 六道</p>
          <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[1] tracking-tight text-[var(--sumi)]">Everything about Japan, in one companion.</h2>

          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-3">
            <Domain icon={<Plane />} title="Travel &amp; Places" bullets={["Season-tuned itineraries", "JR pass math &amp; routing", "Ryokan & onsen etiquette", "Hidden gems by prefecture"]} />
            <Domain icon={<BookOpen />} title="Language" bullets={["N5 → N1 graded lessons", "Kanji breakdowns", "Grammar with real examples", "Inline conversation practice"]} />
            <Domain icon={<Briefcase />} title="Career" bullets={["Rirekisho &amp; shokumu drafting", "Engineer &amp; SSW visa timelines", "Salary bands by prefecture", "Recruiter shortlist &amp; agencies"]} />
            <Domain icon={<GraduationCap />} title="Study" bullets={["MEXT &amp; private scholarships", "Language school comparisons", "Dorm rules &amp; part-time limits", "University entry tracks"]} />
            <Domain icon={<Building2 />} title="Living" bullets={["Ward-by-ward rent", "Hanko &amp; my-number setup", "Health insurance walkthrough", "Garbage schedule &amp; recycling"]} />
            <Domain icon={<Compass />} title="Culture" bullets={["Festival calendar", "Tea ceremony basics", "Business-card ritual", "Senpai / kōhai dynamics"]} />
          </div>
        </div>
      </section>

      {/* Why differently */}
      <section className="border-b border-border/60 bg-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-16 px-8 py-24 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">005 · Contrast</p>
            <h2 className="mt-4 font-serif text-5xl leading-[1] tracking-tight text-[var(--sumi)]">General vs Yuki.</h2>
          </div>
          <div className="space-y-8">
            <Contrast q="How do I move to Japan?" g="Generic bullet list about visa types." y="A year-by-year roadmap keyed to your target date, JLPT level, and profession." />
            <Contrast q="Best time to visit Kyoto?" g="&ldquo;Spring or autumn.&rdquo;" y="Momiji peaks Arashiyama Nov 18–24 this year — book Higashiyama ryokans by mid-August." />
            <Contrast q="How do I write my rirekisho?" g="Translated Western resume." y="Correct 履歴書 layout, photo spec, family register field, and keigo cover email." />
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Numbers</p>
          <div className="mt-10 grid grid-cols-2 gap-10 md:grid-cols-4">
            <BigStat num="47" label="prefectures indexed" />
            <BigStat num="3" label="honorific registers" />
            <BigStat num="< 400ms" label="first token" />
            <BigStat num="100%" label="RLS coverage" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-[1240px] px-8 py-24">
          <div className="relative overflow-hidden border border-border bg-[var(--sumi)] p-14 text-white md:p-20">
            <div className="absolute right-8 top-8 font-serif text-7xl italic text-white/10">機</div>
            <h3 className="max-w-2xl font-serif text-5xl leading-[1] tracking-tight md:text-6xl">Try it on the question you never quite got answered.</h3>
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
          <img src={logo} alt="Yuki" className="h-7 w-7" />
          <span className="font-serif text-xl italic tracking-tight text-[var(--sumi)]">yuki<span className="text-[var(--shu)]">.</span></span>
        </Link>
        <nav className="hidden items-center gap-10 text-[13px] tracking-wide text-muted-foreground md:flex">
          <Link to="/features" className="text-foreground">Features</Link>
          <Link to="/use-cases" className="hover:text-foreground">Use cases</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="hidden text-[13px] tracking-wide text-muted-foreground hover:text-foreground md:inline">Log in</Link>
          <button onClick={onStart} className="bg-[var(--sumi)] px-5 py-2.5 text-[12px] font-medium tracking-wide text-white hover:bg-[var(--shu)] transition">Get started</button>
        </div>
      </div>
    </header>
  );
}

function Pillar({ n, icon, title, tag, body }: { n: string; icon: React.ReactNode; title: string; tag: string; body: string }) {
  return (
    <div className="group relative bg-[var(--washi)] p-10 transition hover:bg-white">
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center border border-border bg-white text-[var(--shu)] transition group-hover:bg-[var(--shu)] group-hover:text-white">{icon}</div>
        <div className="text-right">
          <p className="font-serif text-sm italic text-muted-foreground">{n}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{tag}</p>
        </div>
      </div>
      <p className="mt-8 font-serif text-3xl leading-[1.1] text-[var(--sumi)]">{title}</p>
      <p className="mt-4 text-[14px] leading-[1.7] text-muted-foreground">{body}</p>
    </div>
  );
}

function Domain({ icon, title, bullets }: { icon: React.ReactNode; title: string; bullets: string[] }) {
  return (
    <div className="border-t border-[var(--sumi)] pt-5">
      <div className="flex items-center gap-3 text-[var(--shu)]">{icon}<span className="font-serif text-2xl text-[var(--sumi)]">{title}</span></div>
      <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: bullets.map(b => `<li>· ${b}</li>`).join("") }} />
    </div>
  );
}

function Contrast({ q, g, y }: { q: string; g: string; y: string }) {
  return (
    <div className="border-t border-border pt-6">
      <p className="font-serif text-xl italic text-[var(--sumi)]">&ldquo;{q}&rdquo;</p>
      <div className="mt-4 grid grid-cols-2 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Generic AI</p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40">{g}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--shu)]">Yuki</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--sumi)]">{y}</p>
        </div>
      </div>
    </div>
  );
}

function BigStat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-6xl leading-none text-[var(--sumi)]">{num}</p>
      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
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