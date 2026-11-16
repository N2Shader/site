# 02 Locale switch and alternate links
Status: done
Blocked by: 01

- Corner link to the other locale: real `<a>` with `hreflang` and `lang`, a clear accessible name ("Español" / "English"), keyboard reachable, visible focus.
- `useLocaleHead` output in the head: canonical, hreflang en/es/x-default, `og:locale` + alternate.
- Test: each route has the correct canonical and hreflang set, and the switch points to the other locale.
- The switch carries the `.content-layer` class so it inverts over the ink like the rest of the content layer (ADR-0009, ticket 14). Place it outside any wrapper of the background scene.

## Comments

- 2026-11-16: Built the locale switch and the i18n head tags. `/` and `/es` now ship a canonical, hreflang alternates (x-default, en, en-GB, es, es-ES), `og:locale` + `og:locale:alternate` (`en_GB` / `es_ES`), and a regional `<html lang>`. The switch is a bare `<a class="locale-switch content-layer">` fixed top-right on the `--space-edge` inset, first in the tab order, with `hreflang` and `lang` of the other locale. Its accessible name starts with the visible label ("Español" / "English") and adds a hidden hint in that locale's language ("Español: cambiar el idioma de la página", "English: change the page language"). It has a 44×44px target with the label centred.
  - Owner decisions: e2e seams only (head tags, switch link); no landmark around the link (axe's best-practice "region" rule may flag it); regional language codes now, not in ticket 03 (ADR-0002 consequence added); label stays centred in the 44px box, about 15px below the logo's top edge; switch first in the tab order; a screen-reader hint beyond the locale name.
  - Files: `app/app.vue`, `app/components/LocaleSwitch.vue` (new), `nuxt.config.ts` (language codes), `i18n/locales/en.json`, `es.json` (`localeSwitch.hintInOtherLocale`), `test/e2e/LandingPageRoutes.test.ts`, `docs/adr/0002-locales-en-root-es-prefix.md`, `CLAUDE.md` (folder map).
  - Accepted: nothing reserves the top-right corner. At 320px wide the switch's box ends around x 253 and the "N2Shader" heading around x 147, and the description starts below the switch. A longer heading, logo or label would need inline-end padding on the stack's top rows.
  - Follow-ups: ticket 03 already gets `og:locale` and `og:url` from @nuxtjs/i18n here, so it should only add the rest of the Open Graph tags, not a second `og:url`. The canonical for `/es` has no trailing slash, so ticket 09 must stop Netlify from redirecting `/es` to `/es/`, or the canonical points at a redirect. `/break-ui` was skipped: the switch only shows the two configured locale names.

