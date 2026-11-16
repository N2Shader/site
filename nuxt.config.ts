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
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  // Shared by sitemap, robots and schema-org (ADR-0003).
  site: {
    url: SITE_URL,
    name: 'n2Shader',
  },
  // ADR-0002: English at /, Spanish at /es, no browser-language redirect.
  i18n: {
    baseUrl: SITE_URL,
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    // Messages in i18n/locales/ hold the copy and the contact details, the one source for markup and JSON-LD (ADR-0003).
    locales: [
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'es', language: 'es', name: 'Español', file: 'es.json' },
    ],
  },
  // TODO(copy): placeholder text until the real slogan and description arrive (ADR-0006).
  llms: {
    domain: SITE_URL,
    title: 'n2Shader',
    description: 'PLACEHOLDER: one-paragraph description of what n2Shader does.',
    sections: [
      {
        title: 'Pages',
        links: [
          { title: 'n2Shader (English)', href: '/' },
          { title: 'n2Shader (Español)', href: '/es' },
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
