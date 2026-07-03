import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Search, Filter, Plus, Briefcase, BookOpen, Lightbulb, Utensils, FolderPlus } from "lucide-react";

export const Route = createFileRoute("/library")({ component: LibraryPage });

const COLLECTIONS = [
  { name: "Travel Plans", count: 12, icon: Briefcase, tone: "bg-sky-100 text-sky-600" },
  { name: "Learning Japanese", count: 8, icon: BookOpen, tone: "bg-emerald-100 text-emerald-600" },
  { name: "Work & Productivity", count: 15, icon: Briefcase, tone: "bg-indigo-100 text-indigo-600" },
  { name: "Recipes", count: 6, icon: Utensils, tone: "bg-amber-100 text-amber-600" },
  { name: "Ideas & Inspiration", count: 9, icon: Lightbulb, tone: "bg-rose-100 text-rose-600" },
];

const ITEMS = [
  { name: "Best time to visit Japan", desc: "The best time to visit Japan depends on what you want…", type: "Chat", collection: "Travel Plans", updated: "Today, 9:41 AM" },
  { name: "3-day Tokyo itinerary", desc: "Here's a 3-day itinerary for Tokyo with must-see spots…", type: "Chat", collection: "Travel Plans", updated: "Yesterday, 8:32 PM" },
  { name: "Japanese phrases for beginners", desc: "Basic greetings, useful expressions, and daily phrases.", type: "Document", collection: "Learning Japanese", updated: "May 18, 2025" },
  { name: "Top 10 places to visit in Kyoto", desc: "https://example.com/kyoto-travel-guide", type: "Link", collection: "Travel Plans", updated: "May 17, 2025" },
  { name: "Project ideas brainstorm", desc: "Ideas for the new AI productivity tool…", type: "Note", collection: "Work & Productivity", updated: "May 16, 2025" },
  { name: "Healthy breakfast recipes", desc: "5 easy and nutritious recipes to start your day.", type: "Document", collection: "Recipes", updated: "May 15, 2025" },
];

function LibraryPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">All your saved chats, documents, and resources in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground w-64">
            <Search className="h-3.5 w-3.5" /> Search library <span className="ml-auto text-[10px]">⌘K</span>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs"><Filter className="h-3.5 w-3.5" /> Filter</button>
          <button className="rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New</button>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Collections</h2>
          <a className="text-xs text-primary font-medium">View all</a>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-3">
          {COLLECTIONS.map(({ name, count, icon: Icon, tone }) => (
            <div key={name} className="rounded-xl border border-border p-4">
              <div className={`inline-flex rounded-lg p-2 ${tone}`}><Icon className="h-4 w-4" /></div>
              <p className="mt-3 text-sm font-semibold">{name}</p>
              <p className="text-[11px] text-muted-foreground">{count} items</p>
            </div>
          ))}
          <div className="rounded-xl border border-dashed border-border p-4 flex flex-col items-center justify-center text-muted-foreground">
            <FolderPlus className="h-5 w-5" />
            <p className="mt-2 text-xs">New collection</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4 border-b border-border pb-3 text-sm">
          {["All", "Chats", "Documents", "Images", "Links", "Notes"].map((t, i) => (
            <button key={t} className={i === 0 ? "text-primary border-b-2 border-primary pb-2" : "text-muted-foreground"}>{t}</button>
          ))}
        </div>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-[11px] uppercase text-muted-foreground">
            <tr><th className="py-2">Name</th><th>Type</th><th>Collection</th><th>Updated</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ITEMS.map((it) => (
              <tr key={it.name} className="hover:bg-accent/30">
                <td className="py-3">
                  <p className="text-sm font-medium">{it.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{it.desc}</p>
                </td>
                <td className="text-xs"><span className="rounded-md bg-secondary px-2 py-0.5">{it.type}</span></td>
                <td className="text-xs"><span className="rounded-md bg-accent/50 px-2 py-0.5 text-accent-foreground">{it.collection}</span></td>
                <td className="text-xs text-muted-foreground">{it.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}