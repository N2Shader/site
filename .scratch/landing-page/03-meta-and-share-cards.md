# 03 Meta tags and share cards
Status: done
Blocked by: 02

- Per-locale title and meta description (the description is `landingPage.description` in the locale messages), Open Graph (type, title, description, url, image, image alt, site_name) and Twitter `summary_large_image`.
- Placeholder 1200×630 PNG per locale in `public/` (the real one comes after the scene is designed).
- Test: tags exist and are localized on both routes.

## Comments

- 2026-11-16: Built the title, meta description, Open Graph and X card tags, and the two placeholder share images. `/` and `/es` now ship `<title>N2Shader</title>`, the locale's `landingPage.description` as the meta and `og:description`, `og:type` website, `og:site_name` / `og:title` N2Shader, an absolute `og:image` (`https://n2shader.com/share-image-en.png` / `-es.png`) with `og:image:type`, width 1200, height 630 and a localized `og:image:alt`, plus `twitter:card` summary_large_image and `twitter:image:alt`. `og:url` and `og:locale` still come only from @nuxtjs/i18n (ticket 02).
  - Owner decisions: title is the company name alone, the same in both locales (so not localized); placeholder images show the logo, "N2Shader" and the locale's slogan in Cascadia Mono on paper #f4f2ee; X gets only the card type and image alt and reads the rest from Open Graph; test seams are the e2e head tags and a PNG header check (1200×630).
  - The PNGs were drawn once with Windows System.Drawing from a throwaway script (not in the repo). The alt text (`shareImage.alt`) links the slogan with `@:landingPage.slogan`, so it follows the copy; it describes the placeholder and must change with the real art.
  - Files: `app/composables/useLandingPageMeta.ts` (new), `app/pages/index.vue`, `i18n/locales/en.json`, `es.json` (`shareImage.alt`), `public/share-image-en.png`, `public/share-image-es.png` (new), `test/e2e/LandingPageRoutes.test.ts`, `test/public/ShareImages.test.ts` (new), `GLOSSARY.md` (Share image, Slogan), `CLAUDE.md` (folder map).
  - Follow-ups: replace the placeholder share images (and `shareImage.alt`) once the scene-based art is designed; Google may cut the 200+ character meta description in results (it's the owner's full description by design); the image name comes from the locale code, so a new locale needs its own PNG. `/break-ui` skipped: no visible UI.
