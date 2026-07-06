import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Sun, Globe, Mic, MapPin, Ruler, MessageSquare, Lightbulb, Brain, Shield, Mail, Lock, ShieldCheck, LogOut, ChevronRight, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proactive, setProactive] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  async function deleteAccount() {
    if (!confirm("Permanently delete your account? This cannot be undone.")) return;
    // Delete all user's conversations (cascades to messages) and profile row
    await supabase.from("conversations").delete().eq("user_id", user?.id ?? "");
    await supabase.from("profiles").delete().eq("id", user?.id ?? "");
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Customize your experience and manage your account.</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Preferences">
            <Row icon={<Sun className="h-4 w-4 text-amber-500" />} label="Appearance" sub="Choose your theme preference" value={darkMode ? "Dark mode" : "Light mode"}>
              <button onClick={() => setDarkMode((v) => !v)} className="text-xs text-primary">Toggle</button>
            </Row>
            <Row icon={<Globe className="h-4 w-4 text-indigo-500" />} label="Language" sub="Select your preferred language" value="English" />
            <Row icon={<Mic className="h-4 w-4 text-primary" />} label="Voice" sub="Choose Yuki's voice" value="Yuki (Female)" />
            <Row icon={<MapPin className="h-4 w-4 text-rose-500" />} label="Region" sub="Set your region" value="Japan" />
            <Row icon={<Ruler className="h-4 w-4 text-emerald-500" />} label="Units" sub="Choose your default units" value="Metric (°C, km)" />
          </Card>

          <Card title="Yuki settings">
            <Row icon={<MessageSquare className="h-4 w-4 text-primary" />} label="Response style" sub="Set how Yuki responds to you" value="Balanced" />
            <Row icon={<Lightbulb className="h-4 w-4 text-amber-500" />} label="Proactive suggestions" sub="Allow Yuki to suggest helpful things">
              <Toggle on={proactive} onChange={setProactive} />
            </Row>
            <Row icon={<Brain className="h-4 w-4 text-indigo-500" />} label="Memory" sub="Yuki remembers your preferences" />
            <Row icon={<Shield className="h-4 w-4 text-emerald-500" />} label="Data & privacy" sub="Control your data and privacy settings" />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Account & security">
            <Row icon={<Mail className="h-4 w-4 text-primary" />} label="Email" sub={user?.email ?? ""} />
            <Row icon={<Lock className="h-4 w-4 text-primary" />} label="Change password" sub="Update your account password" />
            <Row icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} label="Two-factor authentication" sub="Off" />
          </Card>

          <Card title="Data management">
            <Row icon={<Trash2 className="h-4 w-4 text-destructive" />} label={<span className="text-destructive">Delete account</span>} sub="Permanently delete your account">
              <button onClick={deleteAccount} className="text-xs text-destructive hover:underline">Delete</button>
            </Row>
          </Card>

          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-medium text-destructive hover:bg-destructive/5">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 divide-y divide-border">{children}</div>
    </section>
  );
}

function Row({ icon, label, sub, value, children }: { icon: React.ReactNode; label: React.ReactNode; sub?: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="rounded-lg bg-accent/50 p-2 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {children ?? (!value && <ChevronRight className="h-4 w-4 text-muted-foreground" />)}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${on ? "left-4" : "left-0.5"}`} />
    </button>
  );
}