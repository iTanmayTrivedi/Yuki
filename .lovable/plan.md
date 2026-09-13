# Polish authentication, journeys, library, and history

## Changes
- Add clear pointer, lift, color, focus, and pressed states to login, signup, Google, password visibility, and mode-switch controls while preserving the split-screen design.
- Remove the Premium panel from the signed-in sidebar and keep the account panel anchored at the bottom.
- Replace hardcoded “Continue your journey” cards with the signed-in user’s live journey records. Show a useful empty state and open a related conversation when available.
- Improve Library with responsive controls, efficient conversation previews, message updates in real time, cleaner loading/empty/search states, and deletion.
- Improve History with responsive list/detail behavior, stable live updates, clearer message presentation, and reliable selection after deletion.
- Add unique page metadata for the changed routes.

## Google sign-in
- Leave Google sign-in unchanged in this pass, as requested. It already calls the connected Supabase project directly, not Lovable AI.
- To make it operational later, enable Google in Supabase Authentication, add the Google client ID/secret, and configure the Supabase callback plus app redirect URLs.

## Technical details
- Continue using Supabase RLS-backed browser queries scoped to the signed-in user.
- Reuse the existing `journeys`, `conversations`, and `messages` data; no database migration is needed.
- Preserve existing chat behavior and current visual tokens.
