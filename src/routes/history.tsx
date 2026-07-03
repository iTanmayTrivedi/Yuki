import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, Filter, Star, Share2, MoreHorizontal, Lock } from "lucide-react";
import logo from "@/assets/yuki-logo.png.asset.json";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  return (
    <AppShell>
      <div className="grid grid-cols-[320px_1fr] gap-4">
        <aside className="rounded-2xl border border-border bg-card p-4 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">History</h1>
            <button className="rounded-md border border-border p-1.5"><Filter className="h-3.5 w-3.5" /></button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Your past conversations and activity.</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" /> Search history
          </div>
          <div className="mt-3 flex gap-1 text-xs">
            {["All", "Chats", "Research", "Documents"].map((t, i) => (
              <button key={t} className={`rounded-full px-2.5 py-1 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="mt-4 space-y-4">
            <Group label="Today" items={[{ t: "Best time to visit Japan", d: "9:41 AM", active: true }, { t: "Learn Japanese basics", d: "8:32 AM" }, { t: "Sustainable living tips", d: "Yesterday" }]} />
            <Group label="Yesterday" items={[{ t: "Book recommendations", d: "May 16" }, { t: "How does AI work?", d: "May 15" }]} />
          </div>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-6 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Best time to visit Japan</h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>💬 Chat</span><span>•</span><span>May 20, 2025 at 9:41 AM</span><span>•</span><span>✨ Yuki Pro</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1.5 border border-border"><Star className="h-3.5 w-3.5" /></button>
              <button className="rounded-md p-1.5 border border-border"><Share2 className="h-3.5 w-3.5" /></button>
              <button className="rounded-md p-1.5 border border-border"><MoreHorizontal className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-[1fr_240px] gap-6">
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="rounded-2xl bg-accent/50 px-4 py-2.5 text-sm max-w-[80%]">What is the best time to visit Japan?</div>
              </div>
              <div className="flex items-start gap-3">
                <img src={logo.url} alt="" className="h-7 w-7 rounded-full bg-white p-1 border border-border" />
                <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm max-w-[80%]">
                  <p>The best time to visit Japan depends on what you want to experience!</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>🌸 Spring (Mar to May): Cherry blossoms, pleasant weather.</li>
                    <li>☀️ Summer (Jun to Aug): Festivals, fireworks — but it's hot and humid.</li>
                    <li>🍁 Autumn (Sep to Nov): Beautiful fall foliage.</li>
                    <li>❄️ Winter (Dec to Feb): Snowy landscapes, ski resorts.</li>
                  </ul>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border p-4 text-xs">
                <p className="font-semibold">Details</p>
                <dl className="mt-3 space-y-2 text-muted-foreground">
                  <div className="flex justify-between"><dt>Model</dt><dd className="text-foreground">Yuki Pro</dd></div>
                  <div className="flex justify-between"><dt>Total messages</dt><dd className="text-foreground">4</dd></div>
                  <div className="flex justify-between"><dt>Total tokens</dt><dd className="text-foreground">1,248</dd></div>
                </dl>
              </div>
              <div className="rounded-xl border border-border p-4 text-xs">
                <p className="font-semibold">Actions</p>
                <ul className="mt-3 space-y-2">
                  <li>Export chat</li>
                  <li>Save to Library</li>
                  <li className="text-destructive">Delete chat</li>
                </ul>
              </div>
              <div className="rounded-xl bg-accent/40 p-4 text-xs">
                <p className="font-semibold flex items-center gap-1">Your history is private <Lock className="h-3 w-3" /></p>
                <p className="mt-1 text-muted-foreground">Yuki stores your history securely and never shares it with anyone.</p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Group({ label, items }: { label: string; items: { t: string; d: string; active?: boolean }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it) => (
          <li key={it.t}>
            <button className={`w-full text-left rounded-lg p-2.5 ${it.active ? "bg-accent" : "hover:bg-accent/40"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate">{it.t}</span>
                <span className="text-[10px] text-muted-foreground">{it.d}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground truncate">Preview…</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}