import { useCallback, useRef, useState } from "react";

export function useStream() {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const start = useCallback(
    async (url: string, body: unknown, onToken: (t: string) => void, onDone?: () => void) => {
      stop();
      const ac = new AbortController();
      abortRef.current = ac;
      setStreaming(true);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ac.signal,
        });
        if (!res.body) throw new Error("no stream body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload) as { text?: string };
              if (parsed.text) onToken(parsed.text);
            } catch {
              /* ignore non-JSON frames */
            }
          }
        }
        onDone?.();
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [stop],
  );

  return { start, stop, streaming };
}