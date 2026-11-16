# 06 One-screen layout and type
Status: done
Blocked by: none

- Fits one viewport (`100svh`, safe areas), never scrolls, and shrinks to fit (ADR-0004).
- Design tokens file (colours, `clamp()` type scale). Font self-hosted via `@nuxt/fonts` with a metric fallback.
- 7:1 contrast for all text against the fallback backdrop; visible focus styles; hover styles only inside `@media (hover: hover)`.
- Set the final `theme-color`.

## Comments

- 2026-11-15: Built the one-screen layout and type with a system-font placeholder. Design direction: content stacked top-left, locale switch top-right on the same `--space-edge` inset (ticket 02), owner supplies the font.
  - Done: `100svh` + safe-area padding, `overflow: hidden` on html/body plus `overflow: clip` on `<main>` so focusing a clipped link can't scroll the page; tokens file with a `clamp()` scale driven by `min(1vw, 1.6svh)` (fits a 568×320 landscape phone, about 300px of content); `--text-colour` #141414 is 16.5:1 against the paper; 3px `:focus-visible` ring; hover only inside `@media (hover: hover)`; `theme-color` #f4f2ee.
  - Files: `app/assets/css/tokens.css` (new), `app/assets/css/base.css`, `app/pages/index.vue`, `app/components/CompanyLogo.vue`, `app/components/ContactDetailsList.vue`, `nuxt.config.ts`, `app/scene/SceneSettings.ts` (comment), `CLAUDE.md` (folder map), `.scratch/landing-page/spec.md` (Open).
  - Left open: drop WOFF2 files in `public/fonts/` named `<Family>-<weight>.woff2` (or `-Variable`), put the family first in `--font-body`, and set `fonts: { processCSSVariables: true }` in `nuxt.config.ts` (@nuxt/fonts skips custom properties by default). Then close.
  - Follow-ups: ticket 02 must keep the locale switch clear of the stack on narrow phones (nothing reserves the corner yet); ticket 10's real slogan needs a fit check on a 568×320 landscape phone; the paper colour lives in three places (tokens.css, SceneSettings.ts, nuxt.config.ts theme-color), each comment points to the others.
- 2026-11-15: Added the owner's font: Cascadia Mono, one variable WOFF2 (weights 200–700, 194 KB) at `public/fonts/CascadiaMono-200-700.woff2`, first in `--font-body` with a monospace fallback stack. No config change needed: @nuxt/fonts already reads `--font-*` properties (the earlier note saying otherwise was wrong). Not yet seen in a browser or build output.
- 2026-11-15: Closed by the owner. The full Cascadia set's location is noted in `tokens.css` for future styles (copy only the file needed). Still open from `/verify`: `<main>`'s `max-block-size: 100%` doesn't resolve inside Nuxt's auto-height `#__nuxt`, so the content block doesn't clip and focusing a clipped link can scroll `<body>`.
