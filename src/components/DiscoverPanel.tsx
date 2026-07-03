import { Sun, Building2, Sparkles, Cloud, ChevronRight } from "lucide-react";
import fuji from "@/assets/fuji-hero.jpg";

export function DiscoverPanel() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Discover</h3>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">For you</span>
        <a className="text-primary font-medium">View all</a>
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        <img src={fuji} alt="" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <span className="absolute top-3 left-3 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-medium uppercase text-white">Trending</span>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-sm font-semibold leading-snug">Japan's new digital nomad visa explained</p>
          <p className="mt-1 text-[10px] opacity-80">5 min read</p>
        </div>
      </div>

      <Item icon={<Sun className="h-4 w-4 text-amber-500" />} title="Phrase of the Day" body={<><span className="font-medium">お疲れ様です</span> (Otsukaresama desu)<br /><span className="text-muted-foreground">Good work / Thanks for your hard work</span></>} />
      <Item icon={<Building2 className="h-4 w-4 text-primary" />} title="Hiring Spotlight" body={<><span className="font-medium">Mercari is hiring</span><br /><span className="text-muted-foreground">Software Engineers in Tokyo</span></>} chev />
      <Item icon={<Sparkles className="h-4 w-4 text-amber-600" />} title="Cultural Insight" body={<><span className="font-medium">Why Japanese people value "Ma" (間)</span></>} chev />
      <Item icon={<Sparkles className="h-4 w-4 text-rose-500" />} title="Yuki Suggests" body={<><span className="font-medium">Plan your Golden Week 2025 trip early!</span></>} chev />

      <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tokyo, Japan</span>
          <Cloud className="h-5 w-5 text-sky-500" />
        </div>
        <p className="mt-1 text-3xl font-semibold">24°<span className="text-lg">C</span></p>
        <p className="text-xs text-muted-foreground">Partly Cloudy</p>
        <p className="mt-1 text-[10px] text-muted-foreground">H: 26°C  L: 18°C</p>
      </div>
    </div>
  );
}

function Item({ icon, title, body, chev }: { icon: React.ReactNode; title: string; body: React.ReactNode; chev?: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
      <div className="rounded-md bg-accent/50 p-2">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className="mt-0.5 text-xs leading-relaxed">{body}</div>
      </div>
      {chev && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </div>
  );
}