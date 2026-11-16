# 14 Text inverts over ink
Status: done
Blocked by: 06, 07

- Content-layer text, logo and locale switch use `mix-blend-mode: difference` over the scene: dark on paper, light on ink (ADR-0009).
- Blend off (plain dark text, 7:1 against the fallback backdrop) under `forced-colors: active`, under reduced motion, before the scene loads and when it fails.
- Focus indicators stay visible over paper and over ink.
- The mid-grey contrast dip is an accepted risk. Don't add a halo or keep ink away from the content without asking.

## Comments

- 2026-11-15: Built the difference blend. `BackgroundScene` writes the scene state onto `<html data-background-scene>`, and the prerendered HTML ships `pending`. `.content-layer` (on `<main>`) gets white text with `mix-blend-mode: difference` only while the state is `running` and `forced-colors` isn't active. That shows as #0b0d11 on paper (about 17:1) and white on black ink. Pending, still frame, failed and forced colours keep plain #141414. The focus ring (`currentColor`) inverts with the text, so it shows on paper and on black ink. Tested: the server HTML at `/` and `/es` ships `pending` with `main.content-layer` (e2e).
  - Files: `app/components/BackgroundScene.vue`, `app/pages/index.vue`, `app/assets/css/tokens.css`, `app/assets/css/base.css`, `test/e2e/LandingPageRoutes.test.ts`, `CLAUDE.md` (folder map).
  - Follow-ups: ticket 02 got a note to give the locale switch `.content-layer`. Ticket 16: over mid-grey ink the focus ring nearly disappears, and the owner wants an unblended indicator. The `<h1>` is now "N2Shader" (the owner's edit, title only).
