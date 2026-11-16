# Stack and libraries for v1

Nuxt 4 + TypeScript + pnpm (the owner's usual stack). Libraries are limited to what the v1 landing page needs:

| Need | Pick | Why |
|------|------|-----|
| Locales | `@nuxtjs/i18n` | Correct lang/hreflang/canonical tags (ADR-0002) |
| Fonts | `@nuxt/fonts` | Self-hosted from n2shader.com: no visitor IPs sent to Google (GDPR), preload, metric fallbacks against layout shift |
| Sitemap / robots / JSON-LD | `@nuxtjs/sitemap`, `@nuxtjs/robots`, `nuxt-schema-org` (they share `nuxt-site-config`) | Only the pieces v1 uses; i18n-aware; typed schema.org helpers. We rejected the `@nuxtjs/seo` bundle because it adds og-image, link-checker and skew-protection that one page doesn't need |
| llms.txt | `nuxt-llms` | Chosen over a static file at the owner's request. It's pre-1.0, so watch for breaking changes |
| Share image | Static 1200×630 PNG per locale in `public/` | Designed once the background scene exists. We rejected `nuxt-og-image` as too heavy for one page |
| Styling | Plain scoped CSS + one tokens file | One screen doesn't justify a CSS framework |
| Background scene | `three` (`three/webgpu` `WebGPURenderer` + TSL) + `gsap`, no TresJS | TresJS was tried and removed. A single decorative scene is mounted imperatively in the browser (ADR-0001). TSL render-target passes run on WebGPU and on its WebGL2 fallback; GSAP drives the intro stroke (ADR-0008) |
| Analytics | None | ADR-0006 |
| Dev tuning panel | `tweakpane` (+ `@tweakpane/core` for its types), devDependencies only | Live sliders for the ink painting's `SceneSettings` (ticket 17). Loaded only under `nuxt dev` with `#debug` in the URL. `import.meta.dev` is false in production, so neither the panel nor Tweakpane is ever bundled and Lighthouse is unaffected (ADR-0006) |
