import type { HiringPost } from "@/types/discover.types";

type JobicyJob = {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobGeo?: string;
  jobIndustry?: string[];
  jobType?: string[];
  pubDate?: string;
};

type JobicyResponse = { jobs?: JobicyJob[] };

function todayInJapan() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function fetchJapanHiring(): Promise<HiringPost[]> {
  const response = await fetch("https://jobicy.com/api/v2/remote-jobs?geo=japan&count=12", {
    headers: { "User-Agent": "YukiAI/1.0 (+https://yuki.tanmaytrivedi.dev)" },
  });
  if (!response.ok) throw new Error(`Jobs provider returned ${response.status}`);
  const data = (await response.json()) as JobicyResponse;
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  return jobs.slice(0, 5).map((job) => ({
    id: `jobicy-${job.id}`,
    company: job.companyName,
    role: job.jobTitle,
    location: job.jobGeo && job.jobGeo !== "Anywhere" ? job.jobGeo : "Remote · Japan eligible",
    url: job.url,
    tags: [...(job.jobIndustry ?? []).slice(0, 2), ...(job.jobType ?? []).slice(0, 1)],
    published_on: job.pubDate?.slice(0, 10) || todayInJapan(),
    source: "Jobicy",
  }));
}