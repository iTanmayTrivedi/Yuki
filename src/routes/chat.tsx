import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";
import { Pin, MoreHorizontal, Search, Edit, ChevronRight } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/chat")({ component: ChatPage });

function ChatPage() {
  const { messages } = useChatStore();
  const title = messages.find((m) => m.role === "user")?.content.slice(0, 60) || "New chat";

  return (
    <AppShell>
      <div className="grid grid-cols-[280px_1fr] gap-4">
        <aside className="rounded-2xl border border-border bg-card p-4 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chats</h2>
            <button className="rounded-md border border-border p-1.5"><Edit className="h-3.5 w-3.5" /></button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" /> Search chats <span className="ml-auto text-[10px]">⌘K</span>
          </div>
          <div className="mt-3 flex gap-1 text-xs">
            {["All", "Pinned", "Today", "This week"].map((t, i) => (
              <button key={t} className={`rounded-full px-2.5 py-1 ${i === 0 ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
          <div className="mt-4 flex-1 overflow-y-auto space-y-4">
            <ChatGroup label="Today" items={[{ t: "Best time to visit Japan", d: "9:41 AM", active: true }, { t: "Learn Japanese basics", d: "8:32 AM" }, { t: "Sustainable living tips", d: "Yesterday" }]} />
            <ChatGroup label="Previous 7 days" items={[{ t: "Book recommendations", d: "May 16" }, { t: "How does AI work?", d: "May 15" }, { t: "Healthy recipes ideas", d: "May 14" }]} />
          </div>
          <button className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs">View all chats</button>
        </aside>

        <ChatWindow
          header={
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-semibold truncate">{title}</p>
              <div className="flex items-center gap-1">
                <button className="rounded-md p-1.5 hover:bg-accent/40"><Pin className="h-4 w-4" /></button>
                <button className="rounded-md p-1.5 hover:bg-accent/40"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
            </div>
          }
        />
      </div>
    </AppShell>
  );
}

function ChatGroup({ label, items }: { label: string; items: { t: string; d: string; active?: boolean }[] }) {
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
              <p className="mt-0.5 text-[10px] text-muted-foreground truncate">Preview of the conversation…</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// silence unused imports
void ChevronRight;