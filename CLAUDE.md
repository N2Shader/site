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

- `app/app.vue`: root component
- `app/assets/css/base.css`: mobile-native baseline plus the `--paper` colour
- `app/components/BackgroundScene.vue`: fallback backdrop + scene canvas; `app/composables/useBackgroundScene.ts` mounts it
- `app/scene/`: framework-free scene code; `SceneController` (lifecycle, motion setting, resize), `ThreeSceneAdapter` (the only three.js file), `SceneSettings` (tuning constants)
- `test/`: Vitest specs (`test/scene` plain, `test/components` in the Nuxt environment)
- `public/`: favicon, later share images
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
