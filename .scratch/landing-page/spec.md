# Spec: n2Shader landing page v1

## Goal
A visitor (or a search/answer engine) landing on n2shader.com learns who n2Shader is and how to reach them, in English or Spanish, on one screen.

## Users
- People looking for n2Shader or its services, on desktop and mobile, including keyboard and screen-reader users.
- Search engines and AI answer engines that index or quote the company.

## Content layer (per locale)
Company name "n2Shader" (the page's single `<h1>`), logo (the inline favicon SVG with an accessible name), slogan, and contact details: email (`mailto:`), phone (`tel:` in E.164 format, displayed in local format), office address (plain text in `<address>`). Plus a locale switch in a corner. Copy is placeholder until the owner provides it.

## Behaviour
- `/` in English, `/es` in Spanish. Never redirects by browser language.
- One screen: no navbar, footer or scroll. Content shrinks to fit (ADR-0004).
- Background scene: client-only, `aria-hidden`, on top of a CSS fallback backdrop. Reduced motion gets a still frame. No pause button (ADR-0005). The scene itself is described in a later prompt.

## Discoverability
Per locale: title, description, canonical, hreflang (en, es, x-default), Open Graph and Twitter cards with a 1200×630 PNG share image. JSON-LD: `Organization` (name, logo, slogan, description, email, telephone, address, sameAs), `WebSite`, `WebPage`. `sitemap.xml` with alternates, `robots.txt` that allows search and AI crawlers, `llms.txt`.

## Accessibility
WCAG 2.2 AAA where feasible: 7:1 contrast against the fallback backdrop and the scene, visible focus, landmarks, correct `lang`, link purpose clear out of context.

## Done
Lighthouse 100 ×4 on `/` and `/es` (mobile), axe zero violations plus a keyboard and screen-reader smoke test, Rich Results Test valid, hreflang and sitemap error-free (ADR-0006).

## Out of scope
Contact form, analytics, cookie banner, CMS, extra pages, auth, backend, visible profile links.

## Open
- Background scene description and design direction for the content layer (fonts, colours, layout, motion) arrive in a later prompt.
- Real copy, contact details and profile URLs in both languages.
