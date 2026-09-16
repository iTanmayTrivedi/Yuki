# Tablet layout and Yuki wordmark

## What will change
- Keep the signed-in left navigation fixed and fully visible on tablet and iPad widths, including the Yuki logo, navigation, recent chats, and account area.
- Make only the main page area scroll, preserving the existing desktop and phone navigation behavior.
- Use the same serif italic “yuki.” wordmark from the landing page in the signed-in sidebar, tablet header, and authentication showcase.
- Tune tablet spacing and widths so content remains readable beside the fixed navigation without clipping.

## Technical details
- Update the shared signed-in shell breakpoints and overflow boundaries so tablet widths use the persistent sidebar instead of the phone drawer.
- Reuse the existing `font-serif`, italic styling, and semantic Yuki color tokens for every wordmark.
- Keep authentication, chat, profile, settings, and existing interactions unchanged.
- Verify the result at an iPad-sized viewport and on desktop/mobile to avoid regressions.
