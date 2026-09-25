import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, MessageSquare, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import logo from "@/assets/yuki-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Chat History | Yuki AI" },
      { name: "description", content: "Review and continue your private conversations with Yuki AI." },
      { property: "og:title", content: "Chat History | Yuki AI" },
      { property: "og:description", content: "Review your private Yuki AI conversation history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

type Convo = { id: string; title: string | null; created_at: string | null };
type Msg = { id: string; role: string; content: string; created_at: string | null };

function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setConversation, setMessages: setChatMessages } = useChatStore();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from("conversations").select("id, title, created_at").order("created_at", { ascending: false });
    if (error) console.error("[History] conversations error", error);
    const next = data ?? [];
    setConvos(next);
    setActiveId((current) => current && next.some((item) => item.id === current) ? current : next[0]?.id ?? null);
    setLoadingList(false);
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    const { data, error } = await supabase.from("messages").select("id, role, content, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (error) console.error("[History] messages error", error);
    setMessages(data ?? []);
    setLoadingMessages(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadConversations();
    const channel = supabase.channel(`history-conversations-${user.id}`).on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void loadConversations()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadConversations, user]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    void loadMessages(activeId);
    const channel = supabase.channel(`history-messages-${activeId}`).on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` }, () => void loadMessages(activeId)).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [activeId, loadMessages]);

  async function del(id: string) {
    if (!confirm("Delete this chat? This cannot be undone.")) return;
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) { console.error("[History] delete error", error); return; }
    const remaining = convos.filter((conversation) => conversation.id !== id);
    setConvos(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id ?? null);
  }

  function continueChat() {
    if (!activeId) return;
    setChatMessages([]);
    setConversation(activeId);
    void navigate({ to: "/chat" });
  }

  const filtered = useMemo(() => convos.filter((conversation) => (conversation.title ?? "").toLowerCase().includes(query.trim().toLowerCase())), [convos, query]);
  const grouped = groupByDay(filtered);
  const active = convos.find((conversation) => conversation.id === activeId) ?? null;

  return (
    <AppShell>
      <div className="grid h-[calc(100vh-120px)] grid-cols-1 gap-0 overflow-hidden md:h-[calc(100vh-80px)] md:grid-cols-[300px_1fr] -mx-4 md:-mx-6">
        <aside className={`${active ? "hidden md:block" : "block"} overflow-y-auto border-r border-border bg-background p-4`}>
          <h1 className="text-xl font-semibold">History</h1>
          <p className="mt-1 text-xs text-muted-foreground">Your private conversation archive.</p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground focus-within:border-primary/40">
            <Search className="h-3.5 w-3.5" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search history" className="min-w-0 flex-1 bg-transparent outline-none" />
          </div>
          {loadingList ? <div className="mt-4 space-y-2">{[0, 1, 2].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div> : (
            <div className="mt-5 space-y-5">
              {filtered.length === 0 && <div className="py-10 text-center"><MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-2 text-xs text-muted-foreground">{query ? "No matching conversations." : "No history yet."}</p></div>}
              {grouped.map((group) => <div key={group.label}><p className="text-[11px] font-semibold uppercase text-muted-foreground">{group.label}</p><ul className="mt-2 space-y-1">{group.items.map((item) => <li key={item.id} className="group flex items-center"><button onClick={() => setActiveId(item.id)} className={`min-w-0 flex-1 cursor-pointer rounded-lg p-2.5 text-left transition ${activeId === item.id ? "bg-accent" : "hover:bg-accent/40"}`}><span className="block truncate text-xs font-medium">{item.title ?? "Untitled"}</span><span className="mt-1 block text-[10px] text-muted-foreground">{formatWhen(item.created_at)}</span></button><button onClick={() => void del(item.id)} aria-label={`Delete ${item.title ?? "conversation"}`} className="cursor-pointer rounded-md p-2 text-muted-foreground opacity-100 transition hover:bg-destructive/10 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button></li>)}</ul></div>)}
            </div>
          )}
        </aside>

        <section className={`${active ? "block" : "hidden md:block"} overflow-y-auto bg-background p-4 sm:p-6`}>
          {!active ? <div className="flex h-full flex-col items-center justify-center text-center"><MessageSquare className="h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Select a conversation</p><p className="mt-1 text-xs text-muted-foreground">Its complete history will appear here.</p></div> : <>
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div className="min-w-0"><button onClick={() => setActiveId(null)} className="mb-3 inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:hidden"><ArrowLeft className="h-3.5 w-3.5" /> All chats</button><h2 className="text-xl font-semibold sm:text-2xl">{active.title ?? "Untitled"}</h2><p className="mt-1 text-xs text-muted-foreground">{active.created_at ? new Date(active.created_at).toLocaleString() : ""}</p></div>
              <div className="flex shrink-0 items-center gap-2"><button onClick={continueChat} className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90">Continue</button><button onClick={() => void del(active.id)} aria-label="Delete conversation" className="cursor-pointer rounded-lg border border-border p-2 text-destructive transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button></div>
            </div>
            <div className="mx-auto mt-6 max-w-3xl space-y-5">
              {loadingMessages ? <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-muted" />)}</div> : messages.length === 0 ? <p className="py-12 text-center text-xs text-muted-foreground">No messages in this chat.</p> : messages.map((message) => message.role === "user" ? <div key={message.id} className="flex justify-end"><div className="max-w-[88%] rounded-2xl bg-accent px-4 py-3 text-sm whitespace-pre-wrap sm:max-w-[75%]">{message.content}</div></div> : <div key={message.id} className="flex items-start gap-3"><img src={logo} alt="Yuki" className="h-8 w-8 shrink-0 rounded-full border border-border bg-card p-1" /><div className="max-w-[88%] rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[80%]">{message.content}</div></div>)}
              <div className="flex items-start gap-2 rounded-lg bg-accent/30 px-4 py-3 text-xs text-muted-foreground"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Your conversation history is private to your account.</span></div>
            </div>
          </>}
        </section>
      </div>
    </AppShell>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

function groupByDay(items: Convo[]) {
  const today: Convo[] = [], week: Convo[] = [], older: Convo[] = [];
  for (const conversation of items) {
    const days = (Date.now() - (conversation.created_at ? new Date(conversation.created_at).getTime() : 0)) / 86400000;
    if (days < 1) today.push(conversation); else if (days < 7) week.push(conversation); else older.push(conversation);
  }
  return [{ label: "Today", items: today }, { label: "Previous 7 days", items: week }, { label: "Older", items: older }].filter((group) => group.items.length);
}