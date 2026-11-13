# English at `/`, Spanish at `/es`, via @nuxtjs/i18n, no automatic redirect

The landing page ships in English (default, unprefixed) and Spanish (`/es`). We use the official `@nuxtjs/i18n` module, not a hand-rolled solution, because it produces the `lang` attribute, canonical, `hreflang` (en, es, x-default) and `og:locale` tags correctly, and those are central to discoverability. Visitors aren't redirected by browser language, since that hides locales from crawlers. A visible locale switch (real links) lets people and crawlers move between them.
