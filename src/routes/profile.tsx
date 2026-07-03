import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BadgeCheck, MapPin, Crown, MessageSquare, Bookmark, Calendar, FileText, HelpCircle, Settings, Globe, Brain, Link as LinkIcon, CreditCard, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account, preferences and insights.</p>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div>
            <p className="flex items-center gap-2 text-2xl font-semibold">Haruka S. <BadgeCheck className="h-5 w-5 text-primary" /></p>
            <p className="text-sm text-muted-foreground">haruka.s@example.com</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> Tokyo, Japan</p>
          </div>
        </div>
        <div className="rounded-xl border border-border p-4 min-w-[260px]">
          <p className="flex items-center gap-2 text-sm font-semibold"><Crown className="h-4 w-4 text-primary" /> Yuki Pro <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Pro</span></p>
          <p className="mt-1 text-xs">You're on Pro Plan</p>
          <p className="text-[10px] text-muted-foreground">Next billing date: May 20, 2025</p>
          <button className="mt-3 w-full rounded-md border border-border py-1.5 text-xs">Manage Plan</button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-border bg-card p-5 grid grid-cols-4 divide-x divide-border">
        {[{ n: 128, l: "Chats", i: MessageSquare }, { n: 23, l: "Saved", i: Bookmark }, { n: 12, l: "Itineraries", i: Calendar }, { n: 8, l: "Documents", i: FileText }].map(({ n, l, i: Icon }) => (
          <div key={l} className="flex items-center gap-3 px-4">
            <div className="rounded-lg bg-accent/50 p-2 text-primary"><Icon className="h-4 w-4" /></div>
            <div><p className="text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>
          </div>
        ))}
      </section>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Your insights</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between"><span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-muted-foreground" /> Questions asked</span><span className="font-semibold">45</span></li>
            <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Time saved</span><span className="font-semibold">12.5 hrs</span></li>
            <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-muted-foreground" /> Topics explored</span><span className="font-semibold">7</span></li>
            <li className="flex items-center justify-between"><span className="flex items-center gap-2">🔥 Streak</span><span className="font-semibold">14 days</span></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Quick access</p>
          <ul className="mt-4 space-y-3 text-sm">
            {[{ i: Settings, l: "Personal information" }, { i: Settings, l: "Preferences" }, { i: Globe, l: "Languages" }, { i: Brain, l: "Memory & personalization" }, { i: LinkIcon, l: "Connected accounts" }, { i: CreditCard, l: "Payment & billing" }].map(({ i: Icon, l }) => (
              <li key={l} className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {l}</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm font-semibold text-left">Achievements</p>
          <div className="mt-4 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100">🗻</div>
          <p className="mt-3 text-sm font-semibold">Japan Explorer</p>
          <p className="text-[11px] text-muted-foreground">Explored 10+ topics about Japan</p>
          <div className="mt-3 flex justify-center gap-2">{["⛩️","🎋","🍡","🛡️"].map(e => <div key={e} className="h-8 w-8 rounded-lg bg-accent/40 flex items-center justify-center text-sm">{e}</div>)}</div>
          <button className="mt-3 w-full rounded-md border border-border py-1.5 text-xs">View all achievements</button>
        </div>
      </div>
    </AppShell>
  );
}