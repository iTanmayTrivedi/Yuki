import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { Sun, Moon, Globe, Mic, MapPin, Ruler, MessageSquare, Lightbulb, Brain, Shield, Mail, Lock, ShieldCheck, LogOut, ChevronRight, Trash2, Download, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMemory } from "@/hooks/use-memory";
import { usePreferences } from "@/hooks/use-preferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

type PanelId = "memory" | "privacy" | "password" | "twofa" | "email" | null;

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { prefs, update } = usePreferences();
  const [panel, setPanel] = useState<PanelId>(null);

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  async function deleteAccount() {
    if (!confirm("Permanently delete your account? This cannot be undone.")) return;
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
            <Row
              icon={prefs.theme === "dark" ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              label="Appearance"
              sub="Choose your theme preference"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{prefs.theme === "dark" ? "Dark mode" : "Light mode"}</span>
                <button
                  onClick={() => update("theme", prefs.theme === "dark" ? "light" : "dark")}
                  className="text-xs text-primary cursor-pointer hover:underline"
                >
                  Toggle
                </button>
              </div>
            </Row>
            <Row icon={<Globe className="h-4 w-4 text-indigo-500" />} label="Language" sub="Select your preferred language">
              <Select value={prefs.language} onChange={(v) => update("language", v)} options={["English", "日本語", "Hindi", "Spanish"]} />
            </Row>
            <Row icon={<Mic className="h-4 w-4 text-primary" />} label="Voice" sub="Choose Yuki's voice">
              <Select value={prefs.voice} onChange={(v) => update("voice", v)} options={["Yuki (Female)", "Haru (Male)", "Neutral"]} />
            </Row>
            <Row icon={<MapPin className="h-4 w-4 text-rose-500" />} label="Region" sub="Set your region">
              <Select value={prefs.region} onChange={(v) => update("region", v)} options={["Japan", "India", "United States", "Europe"]} />
            </Row>
            <Row icon={<Ruler className="h-4 w-4 text-emerald-500" />} label="Units" sub="Choose your default units">
              <Select
                value={prefs.units}
                onChange={(v) => update("units", v as "metric" | "imperial")}
                options={["metric", "imperial"]}
                labels={{ metric: "Metric (°C, km)", imperial: "Imperial (°F, mi)" }}
              />
            </Row>
          </Card>

          <Card title="Yuki settings">
            <Row icon={<MessageSquare className="h-4 w-4 text-primary" />} label="Response style" sub="Set how Yuki responds to you">
              <Select
                value={prefs.responseStyle}
                onChange={(v) => update("responseStyle", v as "concise" | "balanced" | "detailed")}
                options={["concise", "balanced", "detailed"]}
                labels={{ concise: "Concise", balanced: "Balanced", detailed: "Detailed" }}
              />
            </Row>
            <Row icon={<Lightbulb className="h-4 w-4 text-amber-500" />} label="Proactive suggestions" sub="Allow Yuki to suggest helpful things">
              <Toggle on={prefs.proactive} onChange={(v) => update("proactive", v)} />
            </Row>
            <RowButton icon={<Brain className="h-4 w-4 text-indigo-500" />} label="Memory" sub="Yuki remembers your preferences" onClick={() => setPanel("memory")} />
            <RowButton icon={<Shield className="h-4 w-4 text-emerald-500" />} label="Data & privacy" sub="Control your data and privacy settings" onClick={() => setPanel("privacy")} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Account & security">
            <RowButton icon={<Mail className="h-4 w-4 text-primary" />} label="Email" sub={user?.email ?? ""} onClick={() => setPanel("email")} />
            <RowButton icon={<Lock className="h-4 w-4 text-primary" />} label="Change password" sub="Update your account password" onClick={() => setPanel("password")} />
            <RowButton icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} label="Two-factor authentication" sub="Off" onClick={() => setPanel("twofa")} />
          </Card>

          <Card title="Data management">
            <Row icon={<Trash2 className="h-4 w-4 text-destructive" />} label={<span className="text-destructive">Delete account</span>} sub="Permanently delete your account">
              <button onClick={deleteAccount} className="text-xs text-destructive cursor-pointer hover:underline">Delete</button>
            </Row>
          </Card>

          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-medium text-destructive cursor-pointer transition hover:bg-destructive/5">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      {panel === "memory" && <MemoryPanel onClose={() => setPanel(null)} />}
      {panel === "privacy" && <PrivacyPanel userId={user?.id} onClose={() => setPanel(null)} />}
      {panel === "password" && <PasswordPanel onClose={() => setPanel(null)} />}
      {panel === "email" && <EmailPanel current={user?.email ?? ""} onClose={() => setPanel(null)} />}
      {panel === "twofa" && <TwoFactorPanel onClose={() => setPanel(null)} />}
    </AppShell>
  );
}

/* ---------- panels ---------- */

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sumi/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 cursor-pointer text-muted-foreground transition hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function MemoryPanel({ onClose }: { onClose: () => void }) {
  const { facts, loading, add, forget } = useMemory();
  const [text, setText] = useState("");

  return (
    <Modal title="Memory" onClose={onClose}>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim()) return;
          await add(text.trim());
          setText("");
          toast.success("Yuki will remember that");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell Yuki something to remember"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground cursor-pointer transition hover:opacity-90">Save</button>
      </form>

      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
        {!loading && facts.length === 0 && <p className="text-xs text-muted-foreground">No memories yet.</p>}
        {facts.map((f) => (
          <div key={f.id} className="flex items-start gap-2 rounded-xl border border-border px-3 py-2">
            <p className="flex-1 text-xs">{f.fact}</p>
            <button onClick={() => void forget(f.id)} className="text-[11px] text-destructive cursor-pointer hover:underline">Forget</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function PrivacyPanel({ userId, onClose }: { userId?: string; onClose: () => void }) {
  const [busy, setBusy] = useState(false);

  async function exportData() {
    if (!userId) return;
    setBusy(true);
    const { data: conversations } = await supabase.from("conversations").select("*").eq("user_id", userId);
    const ids = (conversations ?? []).map((c) => c.id);
    const { data: messages } = ids.length
      ? await supabase.from("messages").select("*").in("conversation_id", ids)
      : { data: [] };
    const { data: memory } = await supabase.from("user_memory").select("*").eq("user_id", userId);
    const blob = new Blob([JSON.stringify({ conversations, messages, memory }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yuki-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
    toast.success("Your data has been downloaded");
  }

  async function clearChats() {
    if (!userId || !confirm("Delete all your conversations? This cannot be undone.")) return;
    setBusy(true);
    await supabase.from("conversations").delete().eq("user_id", userId);
    setBusy(false);
    toast.success("All conversations deleted");
    onClose();
  }

  return (
    <Modal title="Data & privacy" onClose={onClose}>
      <div className="space-y-2">
        <button disabled={busy} onClick={exportData} className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm cursor-pointer transition hover:bg-accent disabled:opacity-60">
          <Download className="h-4 w-4 text-primary" /> Export my data (JSON)
        </button>
        <button disabled={busy} onClick={clearChats} className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm text-destructive cursor-pointer transition hover:bg-destructive/5 disabled:opacity-60">
          <Trash2 className="h-4 w-4" /> Delete all conversations
        </button>
        <p className="pt-1 text-[11px] text-muted-foreground">Your chats are stored privately and are only visible to you.</p>
      </div>
    </Modal>
  );
}

function PasswordPanel({ onClose }: { onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Modal title="Change password" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 6) return toast.error("Password must be at least 6 characters");
          if (pw !== confirmPw) return toast.error("Passwords do not match");
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) return toast.error(error.message);
          toast.success("Password updated");
          onClose();
        }}
      >
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button disabled={busy} type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground cursor-pointer transition hover:opacity-90 disabled:opacity-60">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </Modal>
  );
}

function EmailPanel({ current, onClose }: { current: string; onClose: () => void }) {
  const [email, setEmail] = useState(current);
  const [busy, setBusy] = useState(false);

  return (
    <Modal title="Email" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ email });
          setBusy(false);
          if (error) return toast.error(error.message);
          toast.success("Check your inbox to confirm the new address");
          onClose();
        }}
      >
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button disabled={busy || email === current} type="submit" className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground cursor-pointer transition hover:opacity-90 disabled:opacity-60">
          {busy ? "Saving…" : "Update email"}
        </button>
      </form>
    </Modal>
  );
}

function TwoFactorPanel({ onClose }: { onClose: () => void }) {
  const [uri, setUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function enroll() {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error) return toast.error(error.message);
    setFactorId(data.id);
    setUri(data.totp.qr_code);
    setSecret(data.totp.secret);
  }

  async function verify() {
    if (!factorId) return;
    setBusy(true);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr || !challenge) {
      setBusy(false);
      return toast.error(cErr?.message ?? "Could not start verification");
    }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Two-factor authentication enabled");
    onClose();
  }

  return (
    <Modal title="Two-factor authentication" onClose={onClose}>
      {!uri ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Add an extra layer of security using an authenticator app.</p>
          <button disabled={busy} onClick={enroll} className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground cursor-pointer transition hover:opacity-90 disabled:opacity-60">
            {busy ? "Preparing…" : "Set up authenticator"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <img src={uri} alt="Two-factor setup QR code" className="mx-auto h-40 w-40 rounded-xl border border-border bg-white p-2" />
          {secret && <p className="text-center text-[11px] text-muted-foreground break-all">{secret}</p>}
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" inputMode="numeric" className="w-full rounded-xl border border-border bg-background px-3 py-2 text-center text-sm tracking-widest outline-none focus:border-primary" />
          <button disabled={busy || code.length < 6} onClick={verify} className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground cursor-pointer transition hover:opacity-90 disabled:opacity-60">
            {busy ? "Verifying…" : "Verify and enable"}
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ---------- primitives ---------- */

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
      {children}
    </div>
  );
}

function RowButton({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 py-3 text-left cursor-pointer transition hover:opacity-80">
      <div className="rounded-lg bg-accent/50 p-2 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function Select({ value, onChange, options, labels }: { value: string; onChange: (v: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-transparent bg-transparent py-1 pr-1 text-xs text-muted-foreground cursor-pointer outline-none transition hover:border-border focus:border-primary"
    >
      {options.map((o) => (
        <option key={o} value={o}>{labels?.[o] ?? o}</option>
      ))}
    </select>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full cursor-pointer transition ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${on ? "left-4" : "left-0.5"}`} />
    </button>
  );
}
