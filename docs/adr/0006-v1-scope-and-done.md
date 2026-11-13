# v1 scope, non-goals and definition of done

v1 is one bilingual landing page: company name, logo (the favicon SVG, inline), slogan and three contact details. The email and phone are links (`mailto:`/`tel:`) and the office address is plain text. Real copy arrives later, so v1 ships with marked placeholders. The bar is accessibility "WCAG 2.2 AAA where feasible" (7:1 text contrast against both the fallback backdrop and the background scene).

**Non-goals:** contact form, analytics (no tracking, so no cookie banner), CMS, blog or extra pages, auth, backend/API, visible profile links.

**Done when:** Lighthouse scores 100 in Performance, Accessibility, Best Practices and SEO on both `/` and `/es` (mobile profile); axe reports zero violations plus a keyboard and screen-reader smoke test; Google's Rich Results Test validates the JSON-LD; hreflang and the sitemap are error-free. Deployment and the real copy are tracked separately and aren't part of done.

The design direction of the content layer is parked until the background scene is described.
