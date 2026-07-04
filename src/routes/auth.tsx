import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, BookOpen, ShieldCheck, User as UserIcon, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
    if (!loading && user) void navigate({ to: "/" });
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
      void navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left hero */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-rose-50 p-10">
        <div className="flex items-center gap-2">
          <img src={logo.url} alt="Yuki" className="h-9 w-9" />
          <span className="text-2xl font-semibold tracking-tight">yuki</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight">
            Explore Japan.<br />The <span className="italic font-medium text-primary">smart</span> way.
          </h1>
          <p className="mt-5 text-sm text-muted-foreground max-w-sm">
            Yuki is your AI companion for discovering, learning, and experiencing Japan.
          </p>
          <ul className="mt-8 space-y-5">
            <Feature icon={<Sparkles className="h-4 w-4" />} title="AI with local insights" desc="Get answers rooted in real local knowledge." />
            <Feature icon={<BookOpen className="h-4 w-4" />} title="Plan with confidence" desc="Itineraries, recommendations, and tips tailored to you." />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Accurate & up to date" desc="Trusted information you can rely on." />
          </ul>
        </div>
        <img
          src={fuji}
          alt=""
          className="pointer-events-none absolute bottom-0 left-0 right-0 w-full h-[320px] object-cover object-bottom opacity-70"
        />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signup" ? "Join Yuki and start exploring Japan." : "Sign in to continue your journey."}
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
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
              className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition"
            >
              {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to Yuki?"}{" "}
            <button
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); }}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signup" ? "Log in" : "Create an account"}
            </button>
          </p>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            By continuing, you agree to Yuki's <Link to="/" className="text-primary">Terms</Link> and <Link to="/" className="text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="rounded-xl bg-white border border-border p-2.5 text-primary shadow-sm">{icon}</div>
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
