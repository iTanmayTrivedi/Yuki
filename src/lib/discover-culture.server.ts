import type { CulturalInsight } from "@/types/discover.types";

type GroqResponse = { choices?: Array<{ message?: { content?: string } }> };

export function todayInJapan() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function createCulturalInsight(apiKey: string): Promise<Omit<CulturalInsight, "id">> {
  const publishedOn = todayInJapan();
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: "You are Yuki's cultural editor. Return strict JSON with title, concept, and body. Explain one specific, accurate Japanese cultural or professional practice for an international professional. The body must be two concise, practical sentences. Avoid stereotypes and generic travel advice.",
        },
        { role: "user", content: `Create today's cultural insight for ${publishedOn} in Japan.` },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Culture provider returned ${response.status}`);
  const completion = (await response.json()) as GroqResponse;
  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error("Culture provider returned no content");
  const parsed = JSON.parse(content) as { title?: string; concept?: string; body?: string };
  if (!parsed.title || !parsed.concept || !parsed.body) throw new Error("Culture provider returned incomplete content");
  return { title: parsed.title, concept: parsed.concept, body: parsed.body, published_on: publishedOn, source: "Yuki cultural desk" };
}