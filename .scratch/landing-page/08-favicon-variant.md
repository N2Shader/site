# 08 Favicon legibility
Status: done
Blocked by: none

- Favicon-only SVG variant with a thicker stroke so it reads at 16px, with a `prefers-color-scheme: dark` style inside the SVG.
- Add `apple-touch-icon` (180×180 PNG). The page logo keeps the original artwork.

## Comments

- 2026-11-16: Built the favicon variant and the apple touch icon. `public/favicon.svg` is now favicon-only: stroke 7 (≈1px lines in a 16px tab, the old 1.5 was ≈0.2px), the vertical line joined into the outline path so the thick top corner is a clean point instead of a notch, viewBox `18.7 5.2 113 113` to fit the miter tips with ~1 unit margin, black strokes and paper `#f4f2ee` under `prefers-color-scheme: dark`. `public/apple-touch-icon.png` is 180×180, opaque RGB, the bold mark in black on paper with ~20% padding, linked from the head with `sizes="180x180"`. The page logo (`CompanyLogo.vue`) keeps the original artwork.
  - Owner decisions: stroke 7 with the joined top; black / paper colours; touch icon = bold mark on paper; test seams = plain checks of the files in `test/public` plus the e2e head links on both routes.
  - The PNG was drawn once with Windows System.Drawing from a throwaway script (not in the repo), which also measured the stroked bounds for the viewBox.
  - Files: `public/favicon.svg`, `public/apple-touch-icon.png` (new), `nuxt.config.ts` (head link), `app/components/CompanyLogo.vue` (comment), `app/assets/css/tokens.css` (paper colour sync note), `test/public/SiteIcons.test.ts`, `PngHeader.ts`, `PublicFiles.ts` (new), `test/public/ShareImages.test.ts` (uses the shared helpers), `test/e2e/LandingPageRoutes.test.ts` (site icons block), `CLAUDE.md` (folder map), `spec.md` (logo line).
  - Follow-ups: `docs/adr/0006-v1-scope-and-done.md` still calls the page logo "the favicon SVG, inline" (left as written history; amend if wanted); no `favicon.ico` fallback for very old browsers or crawlers that only fetch `/favicon.ico` (not asked; would 404); the paper colour is now repeated in tokens.css, theme-color, the favicon and the touch icon (noted in tokens.css). `/break-ui` skipped: no UI that renders data.
