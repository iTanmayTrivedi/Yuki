import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookMarked,
  History,
  Home,
  LogOut,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  Settings,
  Sun,
  Trash2,
  User,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/yuki-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useChatStore } from "@/lib/chat-store";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { MobileNav } from "@/components/MobileNav";

const nav = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageSquarePlus },
  { to: "/library", label: "Library", icon: BookMarked },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children, rightPanel }: { children: ReactNode; rightPanel?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { profile, avatarUrl } = useProfile();
  const { setConversation, setMessages, reset, conversationId } = useChatStore();
  const [convos, setConvos] = useState<{ id: string; title: string | null; created_at: string | null }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  // Auth gate
  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) console.error("[AppShell] load conversations error", error);
      if (!cancelled && data) setConvos(data);
    }
    void load();
    const channel = supabase
      .channel("conversations-sidebar")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  function openConversation(id: string) {
    setMessages([]);
    setConversation(id);
    void navigate({ to: "/chat" });
  }

  function newChat() {
    reset();
    void navigate({ to: "/chat" });
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this chat? This cannot be undone.")) return;
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      console.error("[AppShell] delete conversation error", error);
      return;
    }
    setConvos((prev) => prev.filter((c) => c.id !== id));
    if (conversationId === id) reset();
  }

  async function signOut() {
    await supabase.auth.signOut();
    reset();
    void navigate({ to: "/auth" });
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const displayName =
    profile?.full_name?.trim() ||
    (user.user_metadata as { full_name?: string } | null)?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "You";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {mobileSidebar && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileSidebar(false)}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <aside
        className={`${mobileSidebar ? "flex" : "hidden"} md:flex fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 flex-col border-r border-border bg-sidebar h-screen md:h-full overflow-hidden`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <img src={logo} alt="Yuki" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">yuki ai</span>
          <button className="md:hidden ml-auto" onClick={() => setMobileSidebar(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-medium hover:bg-accent/40 transition"
          >
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New Chat</span>
            <kbd className="text-[10px] text-muted-foreground">⌘K</kbd>
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileSidebar(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-accent text-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-accent/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link
            to="/settings"
            onClick={() => setMobileSidebar(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              pathname === "/settings" ? "bg-accent text-accent-foreground font-medium" : "text-sidebar-foreground/80 hover:bg-accent/40"
            }`}
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>

        <div className="mt-6 px-3 flex-1 min-h-0 overflow-y-auto">
          <p className="px-3 text-xs font-medium text-muted-foreground">Recent Chats</p>
          <ul className="mt-2 space-y-0.5">
            {convos.length === 0 && (
              <li className="px-3 py-1.5 text-[11px] text-muted-foreground">No chats yet</li>
            )}
            {convos.map((c) => (
              <li key={c.id}>
                <div
                  onClick={() => openConversation(c.id)}
                  className="group w-full flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-xs hover:bg-accent/40 cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span className="truncate">{c.title ?? "Untitled"}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground group-hover:hidden">{formatWhen(c.created_at)}</span>
                    <button
                      onClick={(e) => deleteConversation(c.id, e)}
                      className="hidden group-hover:inline-flex rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto p-3">
          <div className="relative flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <button
              onClick={() => void navigate({ to: "/profile" })}
              className="flex flex-1 min-w-0 items-center gap-2 text-left"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">{initial}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold">{displayName}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              </div>
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Account menu">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute bottom-full mb-1 right-2 z-20 w-40 rounded-lg border border-border bg-card shadow-lg py-1 text-xs">
                <button
                  onClick={() => { setMenuOpen(false); void navigate({ to: "/settings" }); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/50"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </button>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/50 text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto">
        <header className="flex items-center justify-between gap-2 px-4 md:px-6 py-4">
          <button className="md:hidden rounded-full border border-border bg-background p-2" onClick={() => setMobileSidebar(true)} aria-label="Menu">
            <Menu className="h-4 w-4" />
          </button>
          <div className="md:hidden flex items-center gap-2">
            <img src={logo} alt="" className="h-6 w-6" />
            <span className="text-sm font-semibold">yuki ai</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
          <button className="rounded-full border border-border bg-background p-2"><Bell className="h-4 w-4" /></button>
          <button className="rounded-full border border-border bg-background p-2"><Sun className="h-4 w-4" /></button>
          </div>
        </header>
        <div className="flex-1 min-w-0 flex pb-16 md:pb-0">
          <div className="flex-1 min-w-0 px-4 md:px-6 pb-8">{children}</div>
          {rightPanel && <div className="hidden xl:block w-[340px] shrink-0 border-l border-border bg-sidebar px-5 py-6">{rightPanel}</div>}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}
