import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BadgeCheck, MapPin, MessageSquare, Bookmark, Camera, Loader2, Pencil, Check as CheckIcon, X as XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import fuji from "@/assets/fuji-hero.jpg";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useAuth();
  const { profile, avatarUrl, bannerUrl, update, uploadImage, loading } = useProfile();
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"avatar" | "banner" | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [chatCount, setChatCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setLocation(profile.location ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count: cc } = await supabase.from("conversations").select("*", { head: true, count: "exact" });
      const { count: mc } = await supabase.from("messages").select("*", { head: true, count: "exact" });
      setChatCount(cc ?? 0);
      setMsgCount(mc ?? 0);
    })();
  }, [user]);

  async function pick(kind: "avatar" | "banner", file: File | null) {
    if (!file) return;
    setBusy(kind);
    await uploadImage(file, kind);
    setBusy(null);
  }

  async function save() {
    await update({ full_name: fullName, location, bio });
    setEditing(false);
  }

  if (loading || !profile) {
    return <AppShell><div className="py-20 text-center text-sm text-muted-foreground">Loading profile…</div></AppShell>;
  }

  return (
    <AppShell>
      {/* Banner */}
      <div className="relative -mx-4 md:-mx-6 h-48 md:h-60 overflow-hidden">
        <img src={bannerUrl ?? fuji} alt="Banner" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button
          onClick={() => bannerRef.current?.click()}
          className="absolute top-3 right-4 flex items-center gap-1.5 rounded-lg bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-medium border border-border hover:bg-background"
        >
          {busy === "banner" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          Change banner
        </button>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick("banner", e.target.files?.[0] ?? null)} />
      </div>

      {/* Identity card */}
      <section className="-mt-16 relative rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          <div className="relative shrink-0">
            <div className="h-28 w-28 rounded-full border-4 border-card overflow-hidden bg-gradient-to-br from-primary to-accent">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center text-3xl font-bold text-primary-foreground">
                  {(profile.full_name ?? user?.email ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-1 right-1 rounded-full bg-primary text-primary-foreground p-1.5 shadow-md hover:bg-primary/90"
              aria-label="Change avatar"
            >
              {busy === "avatar" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick("avatar", e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-lg font-semibold outline-none" />
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people a bit about you…" rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none resize-none" />
              </div>
            ) : (
              <>
                <p className="flex items-center gap-2 text-2xl font-semibold">{profile.full_name || "Add your name"} <BadgeCheck className="h-5 w-5 text-primary" /></p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {profile.location}</p>
                )}
                {profile.bio && <p className="mt-2 text-sm text-foreground/80 max-w-xl">{profile.bio}</p>}
              </>
            )}
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={save} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5"><CheckIcon className="h-3.5 w-3.5" /> Save</button>
                <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-2 text-xs inline-flex items-center gap-1.5"><XIcon className="h-3.5 w-3.5" /> Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="rounded-lg border border-border px-3 py-2 text-xs inline-flex items-center gap-1.5 hover:bg-accent/40"><Pencil className="h-3.5 w-3.5" /> Edit profile</button>
            )}
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat n={chatCount} l="Chats" i={<MessageSquare className="h-4 w-4" />} />
        <Stat n={msgCount} l="Messages" i={<Bookmark className="h-4 w-4" />} />
        <Stat n={new Date(profile.created_at ?? Date.now()).toLocaleDateString(undefined, { month: "short", year: "numeric" })} l="Joined" i={<BadgeCheck className="h-4 w-4" />} />
        <Stat n={profile.location ?? "—"} l="Location" i={<MapPin className="h-4 w-4" />} />
      </section>
    </AppShell>
  );
}

function Stat({ n, l, i }: { n: string | number; l: string; i: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-accent/50 p-2 text-primary">{i}</div>
      <div><p className="text-xl font-bold truncate">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>
    </div>
  );
}