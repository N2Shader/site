# 01 Landing page tracer bullet
Status: todo
Blocked by: none

Render the content layer at `/` and `/es` from locale messages, prerendered.

- `app/pages/index.vue` (enables routing for i18n) and `i18n/locales/en.json`, `es.json` with PLACEHOLDER copy and contact details.
- Semantic markup: `<main>`, single `<h1>` "n2Shader", inline logo SVG with an accessible name, slogan, contact list: email `mailto:`, phone `tel:` (E.164), address in `<address>`.
- `<html lang>` matches the locale.
- Contact data lives in one source shared by markup and (later) JSON-LD.
- Test: both routes render the name, slogan and three contact details with the right `lang`.
