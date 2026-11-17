# 10 Swap in real copy
Status: done
Blocked by: 03, 04, 05 (they must read the description and contact details from the locale messages), owner provides the `sameAs` URLs

- Replace every `PLACEHOLDER` / `TODO(copy)`: slogan, description, email, phone, address, `sameAs` URLs, both locales, llms.txt.
- Left: the `sameAs` URLs (ticket 04), and checking that 03 and 04 use `landingPage.description` with no copy of their own.
- Fit check: the description and the contact details on a 568×320 landscape phone (ticket 06 follow-up). My estimate is about 300px of the 320px. It hasn't been checked in a browser, and `<main>` clips anything that overflows.

## Comments

- 2026-11-16: The owner supplied the real copy and contact details, now in `i18n/locales/en.json` and `es.json`:
  - Brand: "N2Shader" (the owner chose this capitalisation over "n2Shader"; CLAUDE.md, GLOSSARY.md, the spec, the site name, llms.txt and the tests now use it). The domain and email stay lowercase.
  - Slogan (`landingPage.slogan`): "Every website is a one-of-a-kind piece of digital art." It is the first sentence of the description (the owner's choice).
  - Description (`landingPage.description`): "At N2Shader, every website is a one-of-a-kind piece of digital art. We build immersive experiences that make customers feel something before they read a single word, because that is what they remember." `nuxt.config.ts` imports `en.json` so llms.txt uses the same text.
  - Email: `n2shader@gmail.com`. Phone: `+447771444593` (E.164), shown as `+44 7771 444593`, the international form, because the site is bilingual and read outside the UK (spec: "displayed in local format", ticket 01 follow-up).
  - Office address: Haworth / West Yorkshire / England (es: Inglaterra), with no street. The locale keys changed from `street, locality, country` to `locality, region, country`.
  - The Spanish slogan and description are my translation and still need the owner to check them.
- 2026-11-16: The owner wants the full description under the `<h1>`, not the one-line slogan. `index.vue` now renders `landingPage.description`. The slogan stays in the locale messages for the JSON-LD `slogan` only. To fit one screen, the paragraph's measure went from 32ch to 60ch (under AAA's 80 characters), `text-wrap: balance` became `pretty`, and the office address is one line ("Haworth, West Yorkshire, England"), as the owner writes it.
- 2026-11-16: The owner checked the Spanish and rewrote the description: "En N2Shader, cada sitio web es una obra de arte digital única. Creamos experiencias inmersivas que tus usuarios no olvidarán." The second sentence is the owner's own Spanish, not a translation of the English. The slogan (first sentence) is unchanged. The Spanish no longer needs checking.
- 2026-11-17: Closed. What I checked:
  - No `PLACEHOLDER` or `TODO(copy)` is left in the code, the locales or llms.txt. The only placeholders left are the share images' art (they wait for the scene-based design), and that isn't copy.
  - The `sameAs` URLs are in `useOrganizationSchema.ts`. Tickets 03 and 04 and llms.txt read `landingPage.description` and keep no copy of their own. `StructuredData.test.ts`, `LandingPageRoutes.test.ts` and `LandingPage.test.ts` pin all of this (26/26 pass).
  - Fit check at 568×320, worked out from the tokens (there was no browser in this session). The fit unit is 5.12px, so the body text is 14px and a 60ch line holds 60 characters. The English description wraps to 4 lines and the Spanish to 3. The stack, padding included, is about 294px tall in English and about 275px in Spanish, so it fits inside 320px. The English content reaches the clip at about 251px of viewport height. Landscape Safari's toolbars leave less than 320px, so the fit still needs a check on a real phone.
  - Files: `app/pages/index.vue` (the comment now has the computed fit), `.scratch/landing-page/spec.md` (removed the open item about the real copy).
  - Follow-up: no ticket covers the browser fit check yet. Proposed: add it to ticket 11 (needs the owner's OK).
