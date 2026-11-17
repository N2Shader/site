# 11 Definition-of-done check
Status: done
Blocked by: 01–09, 12–15

- Lighthouse 100 ×4 on `/` and `/es` (mobile profile).
- axe: zero violations; keyboard and screen-reader smoke test.
- Rich Results Test validates the JSON-LD; hreflang and sitemap error-free.
- Run `/audit-all` before launch.

## Comments

2026-11-17: Ran the done check. Added an axe-core e2e test over the server HTML of `/` and `/es`. It found that the locale switch sat outside every landmark (axe `region`), so the switch is now in a `<nav>` named "Language"/"Idioma".

Results, measured on a local `serve` of `.output/public` with headless Chrome and Lighthouse 13.6 (mobile):
- Performance 100, Best Practices 100 and SEO 100 on both routes. A first cold run of `/` gave 87 (TBT spike while the scene starts); two reruns gave 100.
- Accessibility 96 while the scene runs. axe misreads the difference blend on the h1 and the description. Accepted by the owner and recorded in ADR-0009 and ADR-0006. With reduced motion (still frame) it's 100 on both routes.
- Keyboard: tab order is locale switch, email, phone, with a visible 3px ring at each stop and no scroll. The accessibility tree reads correctly in both locales. No real screen reader (NVDA) was run.
- hreflang and sitemap: the existing e2e tests pass, and the built sitemap.xml lists both locales with alternates.
- Rich Results Test: the owner runs it on the live URL after deploy.
- /audit-all: run, report only. Findings are in the session report.

Caveat: the measured build (07:55) caught another session's analytics work halfway. gtm.js loaded unconditionally and there was no consent banner. The content reveal (app/reveal/) didn't exist yet. The owner chose to close on these results. The consent banner and the reveal are unchecked by Lighthouse and the keyboard test, and the server-HTML axe test can't see the client-only banner.

Files: test/e2e/LandingPageAccessibility.test.ts (new), test/e2e/ServerDocument.ts, app/components/LocaleSwitch.vue, i18n/locales/en.json, i18n/locales/es.json, package.json + pnpm-lock.yaml (axe-core), docs/adr/0009-text-inverts-over-ink.md, docs/adr/0006-v1-scope-and-done.md, CLAUDE.md.

Follow-ups (no tickets created):
- Rerun Lighthouse and the keyboard check once the analytics banner and the content reveal settle. The reveal hides the LCP text until GSAP and the font load.
- Run NVDA on both routes.
- Run the Rich Results Test after deploy.
- The contact links are 22px tall, under AAA 2.5.5's 44px.
