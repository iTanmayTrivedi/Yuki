import type { CulturalInsight } from "@/types/discover.types";

type WikipediaPage = { pageid: number; title: string; extract?: string; fullurl?: string };
type WikipediaResponse = { query?: { pages?: WikipediaPage[] } };

export function todayInJapan() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function fetchCulturalInsight(): Promise<CulturalInsight> {
  const publishedOn = todayInJapan();
  const params = new URLSearchParams({
    action: "query",
    generator: "categorymembers",
    gcmtitle: "Category:Culture of Japan",
    gcmtype: "page",
    gcmlimit: "40",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
    format: "json",
    formatversion: "2",
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": "YukiAI/1.0 (+https://yuki.tanmaytrivedi.dev)" },
  });
  if (!response.ok) throw new Error(`Culture provider returned ${response.status}`);
  const result = (await response.json()) as WikipediaResponse;
  const pages = (result.query?.pages ?? []).filter((page) => page.extract && page.title !== "Culture of Japan");
  if (pages.length === 0) throw new Error("Culture provider returned no articles");
  const seed = Number(publishedOn.replaceAll("-", ""));
  const page = pages[seed % pages.length];
  if (!page?.extract) throw new Error("Culture provider returned incomplete content");
  const sentences = page.extract.match(/[^.!?]+[.!?]+/g)?.slice(0, 2).join(" ").trim() ?? page.extract.slice(0, 360);
  return {
    id: `wikipedia-${page.pageid}`,
    title: page.title,
    concept: "A daily window into Japanese culture",
    body: sentences,
    published_on: publishedOn,
    source: "Wikipedia",
    source_url: page.fullurl,
  };
}