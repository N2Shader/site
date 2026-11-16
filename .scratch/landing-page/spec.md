# Spec: N2Shader landing page v1

## Goal
A visitor (or a search/answer engine) landing on n2shader.com learns who N2Shader is and how to reach them, in English or Spanish, on one screen.

## Users
- People looking for N2Shader or its services, on desktop and mobile, including keyboard and screen-reader users.
- Search engines and AI answer engines that index or quote the company.

## Content layer (per locale)
Company name "N2Shader" (the page's single `<h1>`), logo (the inline favicon SVG with an accessible name), description (the full paragraph), and contact details: email (`mailto:`), phone (`tel:` in E.164 format, displayed in local format), office address (plain text in `<address>`, one line). Plus a locale switch in a corner. The owner supplied the real copy on 2026-11-16 (ticket 10).

## Behaviour
- `/` in English, `/es` in Spanish. Never redirects by browser language.
- One screen: no navbar, footer or scroll. Content shrinks to fit (ADR-0004).
- Background scene: client-only, `aria-hidden`, on top of a CSS fallback backdrop. Visitors paint black ink on textured paper by moving the pointer, and the ink fades back to clean paper (ADR-0008). One random intro stroke plays on load. Reduced motion gets a still frame: clean paper, no ink. No pause button (ADR-0005).
- Content text inverts over the ink (`mix-blend-mode: difference`), with plain dark text in forced colours and whenever the scene isn't running (ADR-0009).

## Discoverability
Per locale: title, description, canonical, hreflang (en, es, x-default), Open Graph and Twitter cards with a 1200×630 PNG share image. JSON-LD: `Organization` (name, logo, slogan, description, email, telephone, address, sameAs), `WebSite`, `WebPage`. `sitemap.xml` with alternates, `robots.txt` that allows search and AI crawlers, `llms.txt`.

## Accessibility
WCAG 2.2 AAA where feasible: 7:1 contrast against the fallback backdrop (over mid-grey ink this is an accepted risk, ADR-0009), visible focus, landmarks, correct `lang`, link purpose clear out of context.

## Done
Lighthouse 100 ×4 on `/` and `/es` (mobile), axe zero violations plus a keyboard and screen-reader smoke test, Rich Results Test valid, hreflang and sitemap error-free (ADR-0006).

## Out of scope
Contact form, analytics, cookie banner, CMS, extra pages, auth, backend, visible profile links.

## Open
- Content-layer font: the owner supplies the files (ticket 06). Layout decided 2026-11-15: content stacked top-left, locale switch top-right. Colours follow the paper and the difference blend (ADR-0009).
- Real copy, contact details and profile URLs in both languages.
