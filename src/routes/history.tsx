import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, Filter, Star, Share2, MoreHorizontal, Lock, Trash2 } from "lucide-react";
import logo from "@/assets/yuki-logo.png.asset.json";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/history")({ component: HistoryPage });

type Convo = { id: string; title: string | null; created_at: string | null };
type Msg = { id: string; role: string; content: string; created_at: string | null };

function HistoryPage() {
  const { user } = useAuth();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });
      if (!cancelled && data) {
        setConvos(data);
        if (!activeId && data.length) setActiveId(data[0].id);
      }
    }
    void load();
    const ch = supabase
      .channel("conversations-history")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(ch); };
  }, [user, activeId]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });
      if (!cancelled && data) setMessages(data);
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  async function del(id: string) {
    if (!confirm("Delete this chat?")) return;
    await supabase.from("conversations").delete().eq("id", id);
    setConvos((p) => p.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  const filtered = convos.filter((c) => (c.title ?? "").toLowerCase().includes(query.toLowerCase()));
  const grouped = groupByDay(filtered);
  const active = convos.find((c) => c.id === activeId) ?? null;

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0 h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] -mx-4 md:-mx-6">
        <aside className="border-r border-border bg-background p-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">History</h1>
            <button className="rounded-md border border-border p-1.5"><Filter className="h-3.5 w-3.5" /></button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Your past conversations.</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search history" className="flex-1 bg-transparent outline-none" />
          </div>
          <div className="mt-4 space-y-4">
            {filtered.length === 0 && <p className="text-xs text-muted-foreground">No history yet.</p>}
            {grouped.map((g) => (
              <div key={g.label}>
                <p className="text-[11px] font-semibold text-muted-foreground">{g.label}</p>
                <ul className="mt-2 space-y-1">
                  {g.items.map((it) => (
                    <li key={it.id}>
                      <div
                        onClick={() => setActiveId(it.id)}
                        className={`group w-full text-left rounded-lg p-2.5 cursor-pointer ${activeId === it.id ? "bg-accent" : "hover:bg-accent/40"}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium truncate">{it.title ?? "Untitled"}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-muted-foreground group-hover:hidden">{formatWhen(it.created_at)}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); void del(it.id); }}
                              className="hidden group-hover:inline-flex rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Delete chat"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="bg-background p-6 overflow-y-auto">
          {!active ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a chat to view its history
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{active.title ?? "Untitled"}</h2>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>💬 Chat</span><span>•</span>
                    <span>{active.created_at ? new Date(active.created_at).toLocaleString() : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="rounded-md p-1.5 border border-border"><Star className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md p-1.5 border border-border"><Share2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => void del(active.id)} className="rounded-md p-1.5 border border-border text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  <button className="rounded-md p-1.5 border border-border"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-[1fr_240px] gap-6">
                <div className="space-y-4">
                  {messages.length === 0 && <p className="text-xs text-muted-foreground">No messages in this chat.</p>}
                  {messages.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="flex justify-end">
                        <div className="rounded-2xl bg-accent/50 px-4 py-2.5 text-sm max-w-[80%] whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ) : (
                      <div key={m.id} className="flex items-start gap-3">
                        <img src={logo.url} alt="" className="h-7 w-7 rounded-full bg-white p-1 border border-border" />
                        <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm max-w-[80%] whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ),
                  )}
                </div>
                <aside className="space-y-4">
                  <div className="rounded-xl border border-border p-4 text-xs">
                    <p className="font-semibold">Details</p>
                    <dl className="mt-3 space-y-2 text-muted-foreground">
                      <div className="flex justify-between"><dt>Total messages</dt><dd className="text-foreground">{messages.length}</dd></div>
                    </dl>
                  </div>
                  <div className="rounded-xl bg-accent/40 p-4 text-xs">
                    <p className="font-semibold flex items-center gap-1">Your history is private <Lock className="h-3 w-3" /></p>
                    <p className="mt-1 text-muted-foreground">Yuki stores your history securely and never shares it with anyone.</p>
                  </div>
                </aside>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}

function groupByDay(items: Convo[]) {
  const today: Convo[] = [], week: Convo[] = [], older: Convo[] = [];
  const now = Date.now();
  for (const c of items) {
    const t = c.created_at ? new Date(c.created_at).getTime() : 0;
    const days = (now - t) / 86400000;
    if (days < 1) today.push(c);
    else if (days < 7) week.push(c);
    else older.push(c);
  }
  return [
    { label: "Today", items: today },
    { label: "Previous 7 days", items: week },
    { label: "Older", items: older },
  ].filter((g) => g.items.length);
}
