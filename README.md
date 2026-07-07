# Yuki — Your AI companion for Japan

Yuki is a Japan-specialist AI: travel, language, work, and culture — held together by memory, honorific register, and a hard scope boundary.

## Why a Japan-specialist AI needs its own architecture

A general-purpose chatbot answers "how do I move to Japan" with a Wikipedia summary. Yuki answers with a **year-by-year roadmap**, references your saved goals, and shifts to keigo when you ask something a Japanese recruiter would read.

That requires infrastructure a general chatbot doesn't have:

- **Scope guard** — hard boundary that rejects off-topic queries before they hit the model, so credits and latency never leak on non-Japan tangents.
- **Honorific register** — algorithmic keigo / casual switching based on who the message is for.
- **Memory injector** — durable per-user facts (goals, JLPT level, target city, timeline) pulled from Supabase and injected into every prompt.
- **Rich response builder** — the model returns structured JSON for roadmaps, timelines, itineraries; the UI renders them as first-class cards, not paragraphs.
- **Intent classifier + response shaper** — every query is routed (visa / language / career / travel / culture) and shaped to the right output format.
- **Token optimizer** — kanji is ~3× denser than English; we exploit that and compress history aggressively without losing meaning.

## Stack

- **Frontend**: Vite + React 19 + TanStack Router + Tailwind v4 + shadcn/ui
- **Backend**: TanStack Start server functions + Supabase Edge Functions for streaming
- **Data**: Supabase Postgres with RLS on every user-scoped table
- **AI**: OpenRouter (fallback ladder) + Lovable AI Gateway

## Quick start

```bash
bun install
bun dev
```

See `ARCHITECTURE.md` for the full system diagram and `AGENTS.md` for Yuki's behavioural contract.
