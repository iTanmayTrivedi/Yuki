import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, ShieldCheck, User as UserIcon, Mail, Lock, Eye, EyeOff, MessageSquare, Compass, Languages, Bot, Zap, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import fuji from "@/assets/fuji-hero.jpg";
import logo from "@/assets/yuki-logo.png.asset.json";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/home" });
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      void navigate({ to: "/home" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/home` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} sign-in failed`);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[hsl(240_40%_98%)] p-4 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="flex items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <img src={logo.url} alt="Yuki" className="h-8 w-8" />
              <span className="text-xl font-semibold tracking-tight">yuki</span>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "signup" ? "Join Yuki and start exploring Japan." : "Sign in to continue your journey."}
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => void oauth("google")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-accent/40 transition"
              >
                <GoogleIcon /> Continue with Google
              </button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <Field label="Full name">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                </Field>
              )}
              <Field label="Email">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              </Field>
              <div>
                <Field label="Password">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input type={showPw ? "text" : "password"} required minLength={mode === "signup" ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Create a password" : "Enter your password"} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>
                {mode === "signup" && <p className="mt-1.5 text-[11px] text-muted-foreground">At least 8 characters</p>}
              </div>

              {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-indigo-500 py-3 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-60 transition"
              >
                {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account?" : "New to Yuki?"}{" "}
              <button
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); }}
                className="font-semibold text-indigo-500 hover:underline"
              >
                {mode === "signup" ? "Log in" : "Create an account"}
              </button>
            </p>

            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              By continuing, you agree to Yuki's <Link to="/" className="text-indigo-500">Terms</Link> and <Link to="/" className="text-indigo-500">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Right: interactive feature showcase */}
        <FeatureShowcase />
      </div>
    </div>
  );
}

function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const features = [
    { icon: MessageSquare, title: "Chat with Yuki", desc: "Ask anything about Japan — get answers grounded in local knowledge and up-to-date sources.", tone: "from-indigo-500 to-violet-500" },
    { icon: Compass, title: "Plan trips", desc: "Personalized itineraries for Kyoto, Tokyo, and hidden gems — built around your style and budget.", tone: "from-rose-500 to-orange-500" },
    { icon: Languages, title: "Learn Japanese", desc: "Daily phrases, grammar breakdowns, and conversation practice from N5 to N1.", tone: "from-emerald-500 to-teal-500" },
    { icon: Bot, title: "Roadmaps & goals", desc: "Multi-year plans for moving, studying, or working in Japan — tracked and updated over time.", tone: "from-sky-500 to-blue-500" },
    { icon: Zap, title: "Web-search enabled", desc: "Yuki checks the web when it matters — visa rules, weather, opening hours, real prices.", tone: "from-amber-500 to-yellow-500" },
    { icon: MapPin, title: "Made for Japan", desc: "Cultural insight, etiquette, food, hiring spotlights — a companion that actually knows the place.", tone: "from-fuchsia-500 to-pink-500" },
  ];
  const A = features[active];
  const Icon = A.icon;
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(240_60%_97%)] via-white to-[hsl(260_60%_96%)] p-10 order-1 lg:order-2 border border-border">
      <div className="flex items-center gap-2.5">
        <img src={logo.url} alt="Yuki" className="h-10 w-10" />
        <span className="text-2xl font-semibold tracking-tight">yuki</span>
      </div>

      <div className="relative z-10">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight">
          Everything Japan.<br />
          One <span className="italic font-medium text-indigo-500">companion</span>.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground max-w-sm">Hover a card to preview what Yuki can do for you.</p>

        {/* Featured preview */}
        <div key={active} className="mt-6 rounded-2xl border border-border bg-white/70 backdrop-blur p-5 shadow-xl transition">
          <div className={`inline-flex rounded-xl bg-gradient-to-br ${A.tone} p-2.5 text-white`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight">{A.title}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{A.desc}</p>
        </div>

        {/* Interactive grid */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <button
                key={f.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`group flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  i === active ? "border-indigo-400 bg-white shadow-md" : "border-border bg-white/60 hover:bg-white"
                }`}
              >
                <span className={`inline-flex rounded-lg bg-gradient-to-br ${f.tone} p-1.5 text-white`}>
                  <FIcon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-semibold leading-tight">{f.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] overflow-hidden">
        <img src={fuji} alt="" className="h-full w-full object-cover object-bottom opacity-30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white" />
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="rounded-xl bg-white border border-border p-2.5 text-indigo-500 shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
        {children}
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.99 6.99 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.22-1.12 3.03-.76.87-2 1.55-3.02 1.47-.13-1.09.42-2.24 1.09-2.98.75-.83 2.02-1.44 3.05-1.52zM20.5 17.28c-.56 1.29-.83 1.87-1.55 3.01-1 1.59-2.41 3.57-4.15 3.58-1.55.02-1.95-1-4.05-.99-2.1.01-2.54 1.01-4.1.99-1.74-.01-3.07-1.79-4.07-3.38C.13 16.32-.16 11.04 2.14 8.24c1.63-1.99 4.21-3.16 6.63-3.16 2.47 0 4.02 1.35 6.06 1.35 1.98 0 3.19-1.35 6.05-1.35 2.16 0 4.44 1.18 6.06 3.22-5.33 2.92-4.46 10.54-6.44 8.98z" />
    </svg>
  );
}