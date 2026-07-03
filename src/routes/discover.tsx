import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DiscoverPanel } from "@/components/DiscoverPanel";

export const Route = createFileRoute("/discover")({ component: DiscoverPage });

function DiscoverPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Discover</h1>
      <p className="mt-1 text-sm text-muted-foreground">Trending topics, phrases, and insights about Japan.</p>
      <div className="mt-6 max-w-md"><DiscoverPanel /></div>
    </AppShell>
  );
}