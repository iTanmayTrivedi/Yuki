# Live Discover content

## What I’ll build
- Replace the Discover panel’s placeholders with live Tokyo weather, current Japan-focused hiring posts, and fresh cultural insights.
- Add the Discover panel to the signed-in home experience without restoring the removed Discover navigation tab.
- Keep the existing visual language and locked tablet/sidebar behavior.

## Data flow
- Add a modular Supabase `discover` Edge Function with separate weather, hiring, culture, and shared response modules.
- Fetch Tokyo conditions from Open-Meteo, aggregate current Japan-relevant roles from a public jobs feed, and curate a dated cultural insight through Yuki’s existing AI provider.
- Cache/sync hiring and cultural results into the existing Supabase tables, while returning live weather directly.
- Require a signed-in user for Discover requests and validate the token before serving content.

## Interface states
- Show compact loading placeholders while data arrives.
- Render source links and “updated” timing for live content.
- Keep the last database-backed hiring and culture entries available if an external source is temporarily unavailable.
- Add clear empty/error states instead of fake fallback content.

## Verification
- Deploy and call the Edge Function against the connected Supabase project.
- Verify the signed-in home screen at desktop and tablet widths, including real content, links, weather, loading, and failure behavior.
