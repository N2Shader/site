# n2Shader site

One-screen bilingual landing page for the company n2Shader: name, logo, slogan and contact details over a decorative three.js background scene. Discoverability (SEO + AEO) and accessibility (WCAG 2.2 AAA where feasible) are the point of the project. Read `GLOSSARY.md` for terms and `docs/adr/` for decisions before changing behaviour.

## Stack

Nuxt 4 (prerendered with `nuxt generate`, deployed to Netlify), TypeScript, pnpm. Modules: `@nuxtjs/i18n`, `@nuxt/fonts`, `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org`, `nuxt-llms`, `@nuxt/eslint`. Scene: `three/webgpu` (`WebGPURenderer` + TSL render-target passes) + `gsap`, mounted client-only (ADR-0008). Styling: plain scoped CSS, no framework.

## Commands

- Install: `pnpm install`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test (single run): `pnpm test`
- Static build: `pnpm generate` (output in `.output/public`)

## Folder map

- `app/app.vue`: root component; sets `<html lang>` from the locale
- `app/pages/index.vue`: the landing page's content layer (enables i18n routing)
- `app/components/CompanyLogo.vue`, `ContactDetailsList.vue`: logo and contact details; `app/composables/useContactDetails.ts` reads the contact details from the locale messages
- `app/assets/css/tokens.css`: design tokens (`--paper`, text colour, font, the `clamp()` type scale and logo size that shrink to fit, spacing, focus ring, the blended text colour); `base.css`: mobile-native baseline, one-screen lock, link and focus styles, the content-layer difference blend (on every element that holds no link) and the focused link's paper-coloured plate (ADR-0009)
- `app/components/BackgroundScene.vue`: fallback backdrop + scene canvas, publishes the scene state as `<html data-background-scene>`; `app/composables/useBackgroundScene.ts` mounts it
- `app/scene/`: framework-free scene code; `SceneController` (lifecycle, motion setting, resize, loop sleep/wake on clean paper and hidden tab), `BrushStroke` (pointer moves to per-frame brush dabs, load), `SimulationGrid` (grid sizes), `QualityTier` (high/low tier from the device), `CleanPaperClock` (when the paper is clean, from simulated seconds since the last ink), `IntroStrokePath` (the random noise path) and `IntroStrokePlayer` (GSAP moves the brush along it; the only GSAP code), `ThreeSceneAdapter` (wires the renderer, brush and simulation), `SceneSettings` (every tuning constant)
- `app/scene/ink/`: the ink simulation's TSL passes (paper, water flow, carry/spread/settle, draw) and their render targets; with `ThreeSceneAdapter`, the only three.js code
- `i18n/locales/`: `en.json`, `es.json`, the copy and contact details (email and phone repeat in both by choice; keep them in sync)
- `test/`: Vitest specs (`test/scene` plain, `test/components` in the Nuxt environment, `test/e2e` builds the app and reads the server HTML, ~1 min)
- `public/`: favicon, `fonts/` (the one Cascadia Mono variable WOFF2 the page uses), later share images
- `nuxt.config.ts`: site URL, locales, SEO modules, llms.txt, prerender routes
- `docs/adr/`: architecture decisions
- `.scratch/<feature>/`: specs and tickets (local markdown tracker)

## Constraints that aren't obvious from the code

- Every indexable fact (name, slogan, contact details, JSON-LD) must be in the prerendered HTML. The background scene never holds content and is `aria-hidden` (ADR-0001).
- English is unprefixed at `/`, Spanish at `/es`. Never redirect by browser language (ADR-0002).
- The page never scrolls, and the background has no pause button. Both are accepted WCAG risks the owner chose (ADR-0004, ADR-0005). Don't "fix" them without asking.
- The background scene is a black-ink painting simulation reimplemented from watercolor.bizar.ro's technique. Never copy its shader text (ADR-0008).
- Content text inverts over the ink with `mix-blend-mode: difference`. The mid-grey contrast dip is an accepted risk (ADR-0009). Don't "fix" it without asking.
- Write the company name exactly as "n2Shader".
- Copy is placeholder (marked `PLACEHOLDER` / `TODO(copy)`) until the owner supplies it.

## Agent skills

- **Issue tracker:** local markdown. A spec is `.scratch/<feature>/spec.md`; tickets are `.scratch/<feature>/NN-<slug>.md` with `Status: todo | doing | done` and `Blocked by:` lines. Don't use GitHub Issues unless asked.
- **Domain docs:** single context, `GLOSSARY.md` at the root and ADRs in `docs/adr/` (`NNNN-slug.md`).
