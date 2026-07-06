import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";
import { Pin, MoreHorizontal, Search, Edit, Trash2 } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/chat")({ component: ChatPage });

type Convo = { id: string; title: string | null; created_at: string | null };

function ChatPage() {
  const { messages, conversationId, setConversation, setMessages, reset } = useChatStore();
  const { user } = useAuth();
  const [convos, setConvos] = useState<Convo[]>([]);
  const [query, setQuery] = useState("");

  const title = messages.find((m) => m.role === "user")?.content.slice(0, 60) || "New chat";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled && data) setConvos(data);
    }
    void load();
    const channel = supabase
      .channel("conversations-chatpage")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  async function del(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await supabase.from("conversations").delete().eq("id", id);
    setConvos((p) => p.filter((c) => c.id !== id));
    if (conversationId === id) reset();
  }

  const filtered = convos.filter((c) => (c.title ?? "").toLowerCase().includes(query.toLowerCase()));
  const grouped = groupByDay(filtered);

  return (
    <AppShell>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] -mx-4 md:-mx-6">
        <aside className="hidden md:flex border-r border-border px-4 py-4 overflow-hidden flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>
            <button onClick={() => reset()} className="rounded-md border border-border p-1.5" title="New chat">
              <Edit className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          <div className="mt-4 flex-1 overflow-y-auto space-y-4">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground px-1">No chats yet. Start a new one!</p>
            )}
            {grouped.map(({ label, items }) => (
              <ChatGroup
                key={label}
                label={label}
                items={items}
                activeId={conversationId}
                onOpen={(id) => {
                  setMessages([]);
                  setConversation(id);
                }}
                onDelete={del}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex flex-col overflow-hidden bg-background">
          <ChatWindow
            header={
              <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-background">
                <p className="text-sm font-semibold truncate">{title}</p>
                <div className="flex items-center gap-1">
                  <button className="rounded-md p-1.5 hover:bg-accent/40"><Pin className="h-4 w-4" /></button>
                  <button className="rounded-md p-1.5 hover:bg-accent/40"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </AppShell>
  );
}

function ChatGroup({
  label,
  items,
  activeId,
  onOpen,
  onDelete,
}: {
  label: string;
  items: Convo[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it) => {
          const active = activeId === it.id;
          return (
            <li key={it.id}>
              <div
                onClick={() => onOpen(it.id)}
                className={`group w-full text-left rounded-lg p-2.5 cursor-pointer ${active ? "bg-accent" : "hover:bg-accent/40"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">{it.title ?? "Untitled"}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground group-hover:hidden">{formatWhen(it.created_at)}</span>
                    <button
                      onClick={(e) => onDelete(it.id, e)}
                      className="hidden group-hover:inline-flex rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function groupByDay(items: Convo[]) {
  const today: Convo[] = [];
  const week: Convo[] = [];
  const older: Convo[] = [];
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
  ].filter((g) => g.items.length > 0);
}
