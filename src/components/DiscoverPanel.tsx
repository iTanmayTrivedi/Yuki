import { Building2, Cloud, CloudRain, ExternalLink, RefreshCw, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDiscoverFeed } from "@/hooks/use-discover-feed";

export function DiscoverPanel() {
  const { phrase, hiring, insight, weather, updatedAt, loading, error, refresh } = useDiscoverFeed();

  if (loading) return <DiscoverSkeleton />;

  return (
    <section className="space-y-5" aria-labelledby="discover-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-jp text-[10px] tracking-widest text-primary">日本の今</p>
          <h2 id="discover-heading" className="mt-1 font-serif text-2xl italic">Discover Japan</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => void refresh()} aria-label="Refresh Discover content" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="border-l-2 border-destructive bg-destructive/5 px-3 py-2 text-xs text-muted-foreground">
          Live updates could not be reached. Try refreshing in a moment.
        </div>
      )}

      {weather ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{weather.city}</span>
            {weather.weather_code >= 51 ? <CloudRain className="h-5 w-5 text-primary" /> : weather.weather_code > 1 ? <Cloud className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
          </div>
          <p className="mt-2 text-4xl font-semibold tabular-nums">{weather.temp_c}°<span className="text-lg">C</span></p>
          <p className="mt-1 text-xs font-medium">{weather.condition}</p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>High {weather.high_c}° · Low {weather.low_c}°</span>
            <a href={weather.source_url} target="_blank" rel="noreferrer" className="hover:text-primary">Open-Meteo</a>
          </div>
        </div>
      ) : (
        <EmptyState icon={<Cloud className="h-4 w-4" />} label="Weather is unavailable right now." />
      )}

      {phrase && (
        <div className="border-y border-border py-4">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Phrase of the day</p>
          <p className="mt-2 font-jp text-xl">{phrase.kanji}</p>
          <p className="mt-1 text-xs">{phrase.romaji}</p>
          <p className="mt-1 text-xs text-muted-foreground">{phrase.meaning}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h3 className="text-xs font-semibold uppercase">Japan hiring spotlight</h3></div>
          <span className="text-[10px] text-muted-foreground">Live</span>
        </div>
        {hiring.length > 0 ? (
          <div className="mt-3 divide-y divide-border border-y border-border">
            {hiring.slice(0, 3).map((job) => (
              <a key={job.id} href={job.url ?? undefined} target="_blank" rel="noreferrer" className="group flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold group-hover:text-primary">{job.role}</p>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{job.company} · {job.location}</p>
                </div>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
              </a>
            ))}
          </div>
        ) : <EmptyState icon={<Building2 className="h-4 w-4" />} label="No current roles are available." />}
      </div>

      {insight ? (
        <div className="rounded-lg border border-border bg-accent/20 p-4">
          <div className="flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-semibold uppercase">Cultural insight</span></div>
          <h3 className="mt-3 font-serif text-lg leading-snug">{insight.title}</h3>
          <p className="mt-1 font-jp text-xs text-primary">{insight.concept}</p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{insight.body}</p>
        </div>
      ) : <EmptyState icon={<Sparkles className="h-4 w-4" />} label="Today’s insight is being prepared." />}

      {updatedAt && <p className="text-[10px] text-muted-foreground">Updated {formatUpdated(updatedAt)} · Live sources</p>}
    </section>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mt-3 flex items-center gap-2 border-y border-border py-4 text-xs text-muted-foreground">
      {icon}{label}
    </div>
  );
}

function DiscoverSkeleton() {
  return <div className="space-y-4" aria-label="Loading Discover content"><div className="h-10 w-40 animate-pulse rounded bg-muted" /><div className="h-36 animate-pulse rounded-lg bg-muted" /><div className="h-28 animate-pulse rounded-lg bg-muted" /><div className="h-32 animate-pulse rounded-lg bg-muted" /></div>;
}

function formatUpdated(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}