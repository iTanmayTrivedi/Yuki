export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function truncate(input: string, max = 60): string {
  const arr = [...input];
  return arr.length <= max ? input : arr.slice(0, max).join("") + "\u2026";
}

export function formatCredits(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

export function formatJP(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}\u5e74${d.getMonth() + 1}\u6708${d.getDate()}\u65e5`;
}