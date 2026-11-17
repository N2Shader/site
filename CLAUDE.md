# N2Shader site

One-screen bilingual landing page for the company N2Shader: name, logo, description and contact details over a decorative three.js background scene. Discoverability (SEO + AEO) and accessibility (WCAG 2.2 AAA where feasible) are the point of the project. Read `GLOSSARY.md` for terms and `docs/adr/` for decisions before changing behaviour.

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
- `app/components/CompanyLogo.vue`, `ContactDetailsList.vue`: logo and contact details; `app/composables/useContactDetails.ts` reads the contact details from the locale messages; `app/composables/useLandingPageMeta.ts` sets the title, meta description, Open Graph and X card tags, and `useOrganizationSchema.ts` adds the `Organization` JSON-LD (and the WebPage's `about` and `inLanguage`) to nuxt-schema-org's WebSite and WebPage (both called from `index.vue`)
- `app/components/LocaleSwitch.vue`: the top-right link to the other locale in a `<nav>` landmark named "Language"/"Idioma" (first in the tab order, rendered from `app.vue`), the other locale's flag (`LocaleFlag.vue`, inline SVG) and code on a paper-coloured chip; `app.vue` also puts the i18n head tags (canonical, hreflang, og:locale) in the head
- `app/assets/css/tokens.css`: design tokens (`--paper`, text colour, font, the `clamp()` type scale and logo size that shrink to fit, spacing, focus ring, the blended text colour); `base.css`: mobile-native baseline, one-screen lock, link and focus styles, the content-layer difference blend (on every element that holds no link or chip), the `.paper-chip` that never inverts, and the focused link's paper-coloured plate (ADR-0009)
- `app/components/AnalyticsConsentBanner.vue`: the bottom-right consent banner for Google Analytics (rendered last from `app.vue`, browser-only), then a small "Cookies" button to change the choice; `app/composables/useAnalyticsConsent.ts` holds the choice, `app/analytics/AnalyticsConsentStore.ts` keeps it in localStorage (12 months) and `app/analytics/GoogleTagManager.ts` loads the owner's Tag Manager container (`GTM-PFX7ZQ43`) and deletes the GA cookies on withdrawal (ADR-0006)
- `app/reveal/`: the content reveal (GSAP DrawSVG + SplitText, the only GSAP code outside the scene): `ContentReveal` (the timeline), `ContentRevealSettings` (its timings), `ContentRevealPendingScript` (the inline head script that, before the first paint, hides the logo, chips and locale switch, paints the company name paper-coloured and starts the description's CSS rise from `base.css`; skipped under reduced motion, ended by a timeout or the first focus); `app/composables/useContentReveal.ts` plays it once from `index.vue`. Parts are marked `data-content-reveal-part`
- `app/components/BackgroundScene.vue`: fallback backdrop + scene canvas, publishes the scene state as `<html data-background-scene>`; `app/composables/useBackgroundScene.ts` mounts it
- `app/scene/`: framework-free scene code; `SceneController` (lifecycle, motion setting, resize, loop sleep/wake on clean paper and hidden tab), `BrushStroke` (pointer moves to per-frame brush dabs, load), `SimulationGrid` (grid sizes), `QualityTier` (high/low tier from the device), `CleanPaperClock` (when the paper is clean, from simulated seconds since the last ink), `InkAgeClock` (hands out the dried ink's age in whole power-of-two ticks, so the half-float age never rounds at high refresh rates), `IntroStrokePath` (the random noise path) and `IntroStrokePlayer` (GSAP moves the brush along it; the scene's only GSAP code), `ThreeSceneAdapter` (wires the renderer, brush and simulation), `SceneAdapter` (the adapter and tuning types), `SceneSettings` (every tuning constant), `PaintingTuningPanel` (the dev-only Tweakpane panel, `nuxt dev` + `#debug`; the only Tweakpane code) and `PaintingSettingsSnippet` (copies the tuned groups as TypeScript)
- `app/scene/ink/`: the ink simulation's TSL passes (paper, water flow, carry/spread/settle, draw), their render targets, and `SettingsUniforms` (the shader-read `SceneSettings` numbers as uniforms, so they can be retuned live); with `ThreeSceneAdapter`, the only three.js code
- `i18n/locales/`: `en.json`, `es.json`, the copy and contact details (email and phone repeat in both by choice; keep them in sync)
- `test/`: Vitest specs (`test/scene` plain, `test/components` in the Nuxt environment, `test/e2e` builds the app and reads the server HTML, ~1 min, including an axe-core run with zero violations allowed; `test/public` plain checks of files in `public/`: share images, favicon and touch icon)
- `public/`: `favicon.svg` (a bold 7-stroke variant of the logo that reads at 16px, paper-coloured on dark tabs; the page logo in `CompanyLogo.vue` keeps the original 1.5 stroke), `apple-touch-icon.png` (180×180, opaque, the bold mark on paper), `fonts/` (the one Cascadia Mono variable WOFF2 the page uses), `share-image-en.png` / `share-image-es.png` (the 1200×630 share images, placeholders until the scene-based art), `logo.png` (512×512, the JSON-LD `Organization.logo`, kept apart from the favicon)
- `nuxt.config.ts`: site URL, locales, SEO modules, llms.txt, prerender routes
- `netlify.toml`: build (pins `NITRO_PRESET=static`, else Netlify's preset writes to `dist/`), www→apex 301, security headers (CSP with `'unsafe-inline'` and the Google Tag Manager/Analytics hosts, HSTS) and cache rules
- `docs/adr/`: architecture decisions
- `.scratch/<feature>/`: specs and tickets (local markdown tracker)

## Constraints that aren't obvious from the code

- Every indexable fact (name, slogan, contact details, JSON-LD) must be in the prerendered HTML. The background scene never holds content and is `aria-hidden` (ADR-0001).
- Google Analytics never loads before the visitor accepts in the consent banner, and Reject stays as easy as Accept (ADR-0006). Don't add Google tags to `nuxt.config.ts` `app.head`.
- English is unprefixed at `/`, Spanish at `/es`. Never redirect by browser language (ADR-0002).
- The page never scrolls, and the background has no pause button. Both are accepted WCAG risks the owner chose (ADR-0004, ADR-0005). Don't "fix" them without asking.
- The background scene is a black-ink painting simulation reimplemented from watercolor.bizar.ro's technique. Never copy its shader text (ADR-0008).
- Content text inverts over the ink with `mix-blend-mode: difference`. The mid-grey contrast dip is an accepted risk (ADR-0009). Don't "fix" it without asking. The locale switch, the contact details and the consent banner are the exceptions: each is a `.paper-chip` (base.css) that never inverts.
- Write the company name exactly as "N2Shader" (lowercase only in the domain and email).
- The slogan, description and contact details are the owner's real copy (2026-11-16); the `es.json` description is the owner's own Spanish wording, not a literal translation (its second sentence differs from the English on purpose). The `sameAs` URLs (GitHub and X, owner-supplied 2026-11-16) live in `useOrganizationSchema.ts`.

## Agent skills

- **Issue tracker:** local markdown. A spec is `.scratch/<feature>/spec.md`; tickets are `.scratch/<feature>/NN-<slug>.md` with `Status: todo | doing | done` and `Blocked by:` lines. Don't use GitHub Issues unless asked.
- **Domain docs:** single context, `GLOSSARY.md` at the root and ADRs in `docs/adr/` (`NNNN-slug.md`).
