# 01 Landing page tracer bullet
Status: done
Blocked by: none

Render the content layer at `/` and `/es` from locale messages, prerendered.

- `app/pages/index.vue` (enables routing for i18n) and `i18n/locales/en.json`, `es.json` with PLACEHOLDER copy and contact details.
- Semantic markup: `<main>`, single `<h1>` "N2Shader", inline logo SVG with an accessible name, slogan, contact list: email `mailto:`, phone `tel:` (E.164), address in `<address>`.
- `<html lang>` matches the locale.
- Contact data lives in one source shared by markup and (later) JSON-LD.
- Test: both routes render the name, slogan and three contact details with the right `lang`.

## Comments

- 2026-11-15: Built the content layer at `/` and `/es` from locale messages: single `<h1>` "n2Shader", inline logo with a per-locale accessible name, slogan, `mailto:` email, `tel:` (E.164) phone, office address in `<address>`; `<html lang>` follows the locale.
  - Files: `app/app.vue`, `app/pages/index.vue`, `app/components/CompanyLogo.vue`, `app/components/ContactDetailsList.vue`, `app/composables/useContactDetails.ts`, `i18n/locales/en.json`, `i18n/locales/es.json`, `nuxt.config.ts`, `CLAUDE.md` (folder map), `test/components/LandingPage.test.ts`, `test/e2e/LandingPageRoutes.test.ts`.
  - Contact details live in the locale messages (one reader, `useContactDetails`, for markup and later JSON-LD). Email and phone repeat in `en.json` and `es.json` by owner choice; keep them in sync.
  - Emails in locale JSON need vue-i18n's literal escape: `hello{'@'}n2shader.com`.
  - Follow-ups: ticket 06 must handle overflow of long unbreakable emails, long address lines and the longer Spanish slogan; ticket 10 should check the phone display against the spec ("displayed in local format"); the e2e test reads the SSR server, not the `nuxt generate` output (ticket 11 covers the real prerender).
