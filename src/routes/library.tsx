import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library | Yuki AI" },
      { name: "description", content: "Search and continue your recent Yuki AI conversations." },
      { property: "og:title", content: "Library | Yuki AI" },
      { property: "og:description", content: "Your searchable, live Yuki AI conversation library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

type Item = { id: string; title: string | null; created_at: string | null; preview: string | null };

function LibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setConversation, setMessages } = useChatStore();
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    const { data: conversations, error: conversationError } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    if (conversationError) {
      setError("Your library could not be loaded.");
      setLoading(false);
      return;
    }
    const ids = (conversations ?? []).map((conversation) => conversation.id);
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data: messages, error: messageError } = await supabase
      .from("messages")
      .select("conversation_id, content, created_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false });
    if (messageError) console.error("[Library] message previews error", messageError);
    const previews = new Map<string, string>();
    for (const message of messages ?? []) {
      if (!previews.has(message.conversation_id)) previews.set(message.conversation_id, message.content);
    }
    setItems((conversations ?? []).map((conversation) => ({ ...conversation, preview: previews.get(conversation.id) ?? null })));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const refresh = async () => { if (active) await load(); };
    void refresh();
    const channel = supabase
      .channel(`library-live-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void refresh())
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [load, user]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => `${item.title ?? ""} ${item.preview ?? ""}`.toLowerCase().includes(normalized));
  }, [items, query]);

  function open(id: string) {
    setMessages([]);
    setConversation(id);
    void navigate({ to: "/chat" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this chat? This cannot be undone.")) return;
    const { error: deleteError } = await supabase.from("conversations").delete().eq("id", id);
    if (deleteError) {
      setError("This conversation could not be deleted.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-3xl font-bold">Library</h1><p className="mt-1 text-sm text-muted-foreground">Every conversation, updated as you chat.</p></div>
          <button onClick={() => { setMessages([]); setConversation(null); void navigate({ to: "/chat" }); }} className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 hover:shadow-md"><Plus className="h-3.5 w-3.5" /> New Chat</button>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-ring/20">
          <Search className="h-4 w-4" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles and messages" className="min-w-0 flex-1 bg-transparent outline-none" />
          {!loading && <span className="text-[11px]">{filtered.length} {filtered.length === 1 ? "chat" : "chats"}</span>}
        </div>

        {error && <div className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        {loading ? (
          <div className="mt-5 space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl border border-border bg-muted" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">{query ? "No matching conversations" : "No conversations yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">{query ? "Try another search." : "Start a chat and it will appear here automatically."}</p>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-border border-y border-border">
            {filtered.map((item) => (
              <li key={item.id} className="group flex items-center gap-2 py-1">
                <button onClick={() => open(item.id)} className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-accent/30">
                  <span className="shrink-0 rounded-lg bg-accent/50 p-2 text-primary"><MessageSquare className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.title ?? "Untitled"}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{item.preview ?? "No messages yet"}</span></span>
                  <span className="hidden shrink-0 pt-1 text-[11px] text-muted-foreground sm:block">{formatWhen(item.created_at)}</span>
                </button>
                <button onClick={() => void remove(item.id)} aria-label={`Delete ${item.title ?? "conversation"}`} className="cursor-pointer rounded-md p-2 text-muted-foreground opacity-100 transition hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}