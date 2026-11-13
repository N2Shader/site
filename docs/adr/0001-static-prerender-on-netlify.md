# Prerender to static HTML on Netlify; background scene is client-only

The site is one page with no per-request data, so it's prerendered with `nuxt generate` and served from Netlify at `https://n2shader.com`. This gives crawlers and answer engines the full content in plain HTML and leaves no server to run. The three.js background scene can't render on the server (WebGL only exists in the browser), so it mounts in the browser over a CSS fallback backdrop, is hidden from assistive tech, and never holds content.

## Consequences

- Anything that must be indexed (company name, slogan, contact details, JSON-LD) has to be in the prerendered HTML, never injected by the scene.
- A contact form, CMS or any runtime data would need a new decision (Netlify Forms/Functions or hybrid rendering).
