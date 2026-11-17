# v1 scope, non-goals and definition of done

v1 is one bilingual landing page: company name, logo (the favicon SVG, inline), slogan and three contact details. The email and phone are links (`mailto:`/`tel:`) and the office address is plain text. Real copy arrives later, so v1 ships with marked placeholders. The bar is accessibility "WCAG 2.2 AAA where feasible" (7:1 text contrast against both the fallback backdrop and the background scene).

**Non-goals:** contact form, CMS, blog or extra pages, auth, backend/API, visible profile links.

**Amended 2026-11-17:** the owner added Google Analytics through their Google Tag Manager container (`GTM-PFX7ZQ43`). It loads only after the visitor accepts in a small consent banner at the bottom right (`AnalyticsConsentBanner.vue`), because analytics cookies need prior consent for EU and UK visitors; a cookieless tool without a banner was offered and declined. Accept and Reject look the same, a "Cookies" button reopens the banner to withdraw, and the choice is kept in localStorage for 12 months. The CSP in `netlify.toml` allows Google's tag and analytics hosts. On small landscape phones the banner can cover part of the content stack until the visitor chooses (accepted with it). That includes a focused contact link, which can fail 2.4.11 Focus Not Obscured (AA) while the banner is open. The owner accepted this on 2026-11-17, because it only lasts until the visitor chooses.

**Done when:** Lighthouse scores 100 in Performance, Accessibility, Best Practices and SEO on both `/` and `/es` (mobile profile); axe reports zero violations plus a keyboard and screen-reader smoke test; Google's Rich Results Test validates the JSON-LD; hreflang and the sitemap are error-free. Deployment and the real copy are tracked separately and aren't part of done. Accessibility is scored in the fallback state (reduced motion). While the scene runs, it scores 96, because axe misreads the difference blend. That 96 is accepted (ADR-0009, 2026-11-17).

The design direction of the content layer is parked until the background scene is described.
