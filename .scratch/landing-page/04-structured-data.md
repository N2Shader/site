# 04 Organization JSON-LD
Status: done
Blocked by: 01

- `nuxt-schema-org`: `Organization` (name "N2Shader", logo, slogan, description from `landingPage.description`, email, telephone, `PostalAddress`, `sameAs` placeholders), `WebSite`, `WebPage` per locale with `inLanguage`.
- Values come from the same source as the visible contact details.
- `PostalAddress`: `addressLocality` Haworth, `addressRegion` West Yorkshire, `addressCountry` `GB` (ISO code; England isn't one). No street or postcode.
- Test: the JSON-LD on each route contains the Organization with the visible email, phone and address.

## Comments

- 2026-11-16: Built the JSON-LD graph. `/` and `/es` now ship the `Organization` as the site's identity (`https://n2shader.com/#identity`) with name, url, logo, the locale's slogan and description, email, E.164 telephone, a `PostalAddress` (Haworth, West Yorkshire, `GB`, no street or postcode) and `sameAs`. nuxt-schema-org's i18n defaults supply the `WebSite` (published by the Organization, linked to its translation) and `WebPage`. The new composable adds the WebPage's `about` (the defaults set it to null without a config-level identity, which can't be localized) and `inLanguage` (the WebPage resolver doesn't inherit it).
  - Owner decisions: `sameAs` is `https://github.com/N2Shader` and `https://x.com/n2shader`, nothing else for now; the logo is a new `public/logo.png` (512×512, black on white, drawn once from the favicon paths with a throwaway script), apart from the favicon that ticket 08 may change; test seam is the e2e JSON-LD graph.
  - Email, phone and address parts come from `useContactDetails` (the locale messages), and the test checks them against the visible `mailto:`, `tel:` and `<address>`. The ISO country code is one constant there, not a locale message.
  - Files: `app/composables/useOrganizationSchema.ts` (new), `app/composables/useContactDetails.ts` (`phoneE164`, `officeAddressParts`), `app/pages/index.vue`, `public/logo.png` (new), `test/e2e/StructuredData.test.ts`, `test/e2e/ServerDocument.ts`, `test/e2e/LandingPageFixtures.ts` (new, shared by both e2e specs), `test/e2e/LandingPageRoutes.test.ts`, `CLAUDE.md` (folder map, sameAs constraint).
  - Follow-ups: ticket 10's "Left: the `sameAs` URLs" is now stale (GitHub and X supplied; more profiles can be added to `PUBLIC_PROFILE_URLS`); nothing checks that `logo.png` is really 512×512 (a size check like the share images' was offered and not picked); the same `#identity` carries English and Spanish slogan/description on the two pages, which crawlers merging by `@id` may see as two versions; `primaryImageOfPage` points at the logo (the resolver adds it), the share image might represent the page better. The X handle could also feed a `twitter:site` tag (ticket 03 area). `/break-ui` skipped: no visible UI.
