import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, Filter, Plus, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/library")({ component: LibraryPage });

type Item = { id: string; title: string | null; created_at: string | null; preview: string | null };

function LibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setConversation, setMessages } = useChatStore();
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .order("created_at", { ascending: false });
      if (!convos) { setLoading(false); return; }
      const withPreview = await Promise.all(
        convos.map(async (c) => {
          const { data: msg } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();
          return { ...c, preview: msg?.content ?? null } as Item;
        }),
      );
      if (!cancelled) { setItems(withPreview); setLoading(false); }
    }
    void load();
    const ch = supabase
      .channel("library-conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(ch); };
  }, [user]);

  const filtered = items.filter((i) => (i.title ?? "").toLowerCase().includes(query.toLowerCase()) || (i.preview ?? "").toLowerCase().includes(query.toLowerCase()));

  function open(id: string) {
    setMessages([]);
    setConversation(id);
    void navigate({ to: "/chat" });
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your live chat history and saved content, updated in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground w-64">
            <Search className="h-3.5 w-3.5" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search library" className="flex-1 bg-transparent outline-none" />
          </div>
          <button onClick={() => { setMessages([]); setConversation(null); void navigate({ to: "/chat" }); }} className="rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Chat</button>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" /> Live activity
        </div>
        {loading ? (
          <p className="mt-4 text-xs text-muted-foreground">Loading your library…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No conversations yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Start a chat and it'll show up here.</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {filtered.map((it) => (
              <li key={it.id}>
                <button onClick={() => open(it.id)} className="w-full flex items-start justify-between gap-4 py-3 text-left hover:bg-accent/30 rounded-lg px-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="rounded-lg bg-accent/50 p-2 text-primary shrink-0"><MessageSquare className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{it.title ?? "Untitled"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{it.preview ?? "No messages yet"}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{formatWhen(it.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// keep Filter/Plus imports referenced
void Filter;