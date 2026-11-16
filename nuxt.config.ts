import EnglishMessages from './i18n/locales/en.json'

const SITE_URL = 'https://n2shader.com'

export default defineNuxtConfig({
  compatibilityDate: '2026-11-12',
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
    'nuxt-llms',
  ],
  css: ['~/assets/css/tokens.css', '~/assets/css/base.css'],
  app: {
    head: {
      // viewport-fit=cover lets the layout use the safe-area insets on notched phones.
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      // The paper colour (--paper in tokens.css), so the browser chrome blends with the page.
      meta: [{ name: 'theme-color', content: '#f4f2ee' }],
      // The favicon is a bold variant of the logo that reads at 16px; iOS home screens take the opaque 180×180 PNG (ticket 08).
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
  // Shared by sitemap, robots and schema-org (ADR-0003).
  site: {
    url: SITE_URL,
    name: 'N2Shader',
  },
  // ADR-0002: English at /, Spanish at /es, no browser-language redirect.
  i18n: {
    baseUrl: SITE_URL,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    // Messages in i18n/locales/ hold the copy and the contact details, the one source for markup and JSON-LD (ADR-0003).
    // Regional codes, so og:locale gets the en_GB / es_ES form Open Graph expects; hreflang lists both forms.
    locales: [
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
    ],
  },
  // ADR-0003: one sitemap.xml for both locales. With i18n prefixes the module would otherwise
  // write a sitemap index plus one sitemap per locale; the hreflang alternates come either way.
  sitemap: {
    sitemaps: false,
  },
  // ADR-0003: the module's default `User-agent: *` group allows every crawler. This group also names the
  // search crawlers, AI answer crawlers and AI-use tokens, so a later catch-all rule can't shut them out.
  // @nuxtjs/sitemap adds the Sitemap line.
  robots: {
    groups: [
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: ['/'],
      },
    ],
  },
  // The English description from the locale messages, so llms.txt says what the page says (ADR-0003).
  llms: {
    domain: SITE_URL,
    title: 'N2Shader',
    description: EnglishMessages.landingPage.description,
    sections: [
      {
        title: 'Pages',
        links: [
          // Absolute, because nuxt-llms prints hrefs as given and llms.txt is read as raw text.
          { title: 'N2Shader (English)', href: `${SITE_URL}/` },
          { title: 'N2Shader (Español)', href: `${SITE_URL}/es` },
        ],
      },
    ],
  },
  // ADR-0001: everything is prerendered by `nuxt generate`.
  nitro: {
    prerender: {
      routes: ['/', '/es'],
      crawlLinks: true,
    },
  },
})
