# Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                      Client (Vite + React)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │
│  │  Routes    │  │  Zustand   │  │  TanStack Query    │    │
│  │  (file-    │  │  stores    │  │  (server cache)    │    │
│  │  based)    │  │            │  │                    │    │
│  └─────┬──────┘  └─────┬──────┘  └─────────┬──────────┘    │
└────────┼──────────────┼──────────────────┼─────────────────┘
         │              │                  │
         ▼              ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Auth + DB + Edge)              │
│                                                             │
│   ┌─────────────────────────────────────────────────┐      │
│   │  Edge Function /chat                            │      │
│   │  ┌─────────────┐  ┌───────────────┐             │      │
│   │  │ scope_guard │→ │ prompt        │             │      │
│   │  │ intent_     │  │ orchestrator  │             │      │
│   │  │ classifier  │  │               │             │      │
│   │  └─────────────┘  └───┬───────────┘             │      │
│   │                       ▼                         │      │
│   │              ┌──────────────────┐               │      │
│   │              │ openrouter_stream│──► SSE ──►    │      │
│   │              └──────────────────┘               │      │
│   └─────────────────────────────────────────────────┘      │
│                                                             │
│   Postgres tables (all RLS-scoped to auth.uid())            │
│     profiles · conversations · messages                     │
│     user_memory · journeys · achievements · user_streaks    │
│     phrases · hiring_posts · cultural_insights              │
│     user_documents · user_plans                             │
└─────────────────────────────────────────────────────────────┘
```

## Data flow: a single message

1. User submits message from `ChatWindow`.
2. Client inserts into `conversations` (if new) via Supabase (RLS ensures ownership).
3. Client POSTs `{ conversation_id, message }` to Edge Function `/chat`.
4. `scope_guard` verifies the query is Japan-relevant; off-topic → early return.
5. `intent_classifier` tags the query (`career` | `visa` | `language` | `travel` | `culture` | `general`).
6. `memory_injector` pulls active `user_memory` facts.
7. `context_compressor` summarises old turns if history exceeds token budget.
8. `prompt_orchestrator` assembles: system + memory + register + compressed history + user turn.
9. `openrouter_stream` streams tokens via SSE, with a fallback model ladder.
10. `response_shaper` inspects final output; `rich_response_builder` upgrades it to typed roadmap/timeline/card JSON when structure is detected.
11. Assistant message persisted; client renders with `StreamingMessage`.

## Row-Level Security

Every user-scoped table has policies of the form:
```sql
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
```
Public catalogues (`phrases`, `hiring_posts`, `cultural_insights`, `achievements`) grant `SELECT` to `authenticated` only. Nothing is exposed to `anon`.

## Why Supabase Edge over a traditional server

- Cold starts under 50ms — perceived as instant.
- Deploys colocated with Postgres, so RLS-scoped fetches inside the function are one hop.
- SSE support is native (`Deno.serve`) — token-by-token streaming without proxy layers.
- Trade-off: Deno runtime, no long-running processes. We accept that.

*** Add File: CHANGELOG.md
# Changelog

All notable Yuki releases. Newest first.

## [Unreleased]
### Added
- Full Japan-domain data model: `user_memory`, `journeys`, `achievements`, `user_achievements`, `user_streaks`, `phrases`, `hiring_posts`, `cultural_insights`, `user_documents`, `user_plans`.
- Edge Function `/chat` split into eleven composable modules (scope guard, intent classifier, honorific register, memory injector, context compressor, prompt orchestrator, token optimizer, response shaper, rich response builder, system prompt template, openrouter stream).
- New client components: `StreamingMessage`, `RoadmapTimeline`, `QuickReplyChips`, `PersonaToggle`, `MemoryBar`, `JourneyCard`, `AchievementBadge`, `PhraseOfTheDay`, `HiringSpotlight`, `CulturalInsightCard`, `WeatherWidget`, `StreakBadge`, `PremiumGate`, `DocumentViewer`, `InsightsStat`, `ItineraryCard`.
- Zustand `user-store` and `ui-store` alongside existing chat store.
- Typed hooks: `use-stream`, `use-chat-history`, `use-discover-feed`, `use-journey`, `use-memory`, `use-streak`, `use-achievements`, `use-premium`, `use-documents`, `use-think-deeper`.

## [0.3.0]
### Added
- Profile customisation (avatar, banner, bio, location) with private Supabase storage bucket and signed URLs.
- Mobile navigation with slide-in sidebar.
- Realtime library feed.
- Split-panel auth screen with interactive Yuki capabilities showcase.

### Removed
- Discover tab (folded into Library).
- Apple sign-in.
- Premium badge from top nav.

## [0.2.0]
### Added
- Landing page hero, suggestion chips, journey cards.
- Chat page with conversation history sidebar.
- OpenRouter-backed edge function with model fallback.

## [0.1.0]
### Added
- Initial scaffold: TanStack Start, Supabase auth, base routes.
