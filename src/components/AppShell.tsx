import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageSquarePlus, Compass, BookMarked, History, User, Sparkles, Bell, Sun, MoreHorizontal, Plus } from "lucide-react";
import logo from "@/assets/yuki-logo.png.asset.json";
import { type ReactNode } from "react";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageSquarePlus },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/library", label: "Library", icon: BookMarked },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children, rightPanel }: { children: ReactNode; rightPanel?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center gap-2 px-5 py-5">
          <img src={logo.url} alt="Yuki" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">yuki ai</span>
        </div>
        <div className="px-3">
          <Link
            to="/chat"
            className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2 text-sm font-medium hover:bg-accent/40 transition"
          >
            <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New Chat</span>
            <kbd className="text-[10px] text-muted-foreground">⌘K</kbd>
          </Link>
        </div>
        <nav className="mt-4 flex flex-col gap-0.5 px-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-accent/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 px-3">
          <p className="px-3 text-xs font-medium text-muted-foreground">Recent Chats</p>
          <ul className="mt-2 space-y-0.5">
            {[
              { t: "Moving to Japan in 2028", d: "Just now" },
              { t: "Best ramen in Tokyo", d: "2 hours ago" },
              { t: "Improve my Japanese", d: "Yesterday" },
              { t: "Tokyo 7-day itinerary", d: "Yesterday" },
              { t: "How to start a business in…", d: "2 days ago" },
            ].map((c) => (
              <li key={c.t}>
                <button className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-xs hover:bg-accent/40">
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    <span className="truncate">{c.t}</span>
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{c.d}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto p-3 space-y-3">
          <div className="rounded-xl border border-border bg-gradient-to-br from-accent/60 to-secondary p-4">
            <div className="flex items-center gap-1 text-sm font-semibold">Go Premium <Sparkles className="h-3.5 w-3.5 text-primary" /></div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Unlock Yuki's full potential with advanced models, file uploads, longer conversations and more.
            </p>
            <button className="mt-3 w-full rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition">
              Upgrade Now
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold">Haruka S.</p>
              <p className="truncate text-[10px] text-muted-foreground">Premium Plan</p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-end gap-2 px-6 py-4">
          <button className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Premium
          </button>
          <button className="rounded-full border border-border bg-background p-2"><Bell className="h-4 w-4" /></button>
          <button className="rounded-full border border-border bg-background p-2"><Sun className="h-4 w-4" /></button>
        </header>
        <div className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0 px-6 pb-8">{children}</div>
          {rightPanel && <div className="hidden xl:block w-[340px] shrink-0 border-l border-border bg-sidebar px-5 py-6">{rightPanel}</div>}
        </div>
      </main>
    </div>
  );
}