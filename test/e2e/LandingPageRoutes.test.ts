// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { DESCRIPTIONS, SITE_URL } from './LandingPageFixtures'
import { fetchServerDocument } from './ServerDocument'

// Builds and serves the app once, then reads the server HTML: what crawlers get (ADR-0001).
await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)) })

describe.each([
  { route: '/', lang: 'en-GB', description: DESCRIPTIONS.en, country: 'England' },
  { route: '/es', lang: 'es-ES', description: DESCRIPTIONS.es, country: 'Inglaterra' },
])('server HTML at $route', ({ route, lang, description, country }) => {
  it(`is in ${lang} and holds the name, description and three contact details`, async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(serverDocument.documentElement.getAttribute('lang')).toBe(lang)
    expect(serverDocument.querySelector('main h1')?.textContent).toBe('N2Shader')
    expect(serverDocument.querySelector('main p')?.textContent).toBe(description)
    expect(serverDocument.querySelector('a[href="mailto:n2shader@gmail.com"]')).not.toBeNull()
    expect(serverDocument.querySelector('a[href="tel:+447771444593"]')).not.toBeNull()
    expect(serverDocument.querySelector('address')?.textContent).toContain(country)
  })

  it('ships with the scene pending, so the content layer is plain dark text until it runs (ADR-0009)', async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(serverDocument.documentElement.getAttribute('data-background-scene')).toBe('pending')
    expect(serverDocument.querySelector('main')?.classList.contains('content-layer')).toBe(true)
  })
})

// The one element the selector matches; fails the test if there are none or several.
const readSingleElement = (serverDocument: Document, selector: string) => {
  const matchingElements = serverDocument.querySelectorAll(selector)
  expect(matchingElements, selector).toHaveLength(1)
  return matchingElements[0]!
}

const readHreflangAlternates = (serverDocument: Document) =>
  Object.fromEntries(
    [...serverDocument.querySelectorAll('link[rel="alternate"][hreflang]')].map((alternateLink) => [
      alternateLink.getAttribute('hreflang'),
      alternateLink.getAttribute('href'),
    ]),
  )

// Open Graph tags are keyed by `property`, the others by `name`.
const readMetaContents = (serverDocument: Document, keyAttribute: 'property' | 'name', key: string) =>
  [...serverDocument.querySelectorAll(`meta[${keyAttribute}="${key}"]`)].map((metaTag) => metaTag.getAttribute('content'))

describe.each([
  { route: '/', canonical: SITE_URL, ogLocale: 'en_GB', ogLocaleAlternate: 'es_ES' },
  { route: '/es', canonical: `${SITE_URL}/es`, ogLocale: 'es_ES', ogLocaleAlternate: 'en_GB' },
])('locale alternates at $route (ADR-0002)', ({ route, canonical, ogLocale, ogLocaleAlternate }) => {
  it('names its canonical URL and both locales, with English as x-default', async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(readSingleElement(serverDocument, 'link[rel="canonical"]').getAttribute('href')).toBe(canonical)
    // The bare language and the regional code both point at each locale.
    expect(readHreflangAlternates(serverDocument)).toEqual({
      'x-default': SITE_URL,
      'en': SITE_URL,
      'en-GB': SITE_URL,
      'es': `${SITE_URL}/es`,
      'es-ES': `${SITE_URL}/es`,
    })
    expect(readMetaContents(serverDocument, 'property', 'og:locale')).toEqual([ogLocale])
    expect(readMetaContents(serverDocument, 'property', 'og:locale:alternate')).toEqual([ogLocaleAlternate])
  })
})

describe.each([
  { route: '/', description: DESCRIPTIONS.en },
  { route: '/es', description: DESCRIPTIONS.es },
])('search result tags at $route (ADR-0003)', ({ route, description }) => {
  it('titles the page with the company name and describes it in its locale', async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(readSingleElement(serverDocument, 'head title').textContent).toBe('N2Shader')
    expect(readMetaContents(serverDocument, 'name', 'description')).toEqual([description])
  })
})

describe.each(['/', '/es'])('site icons at %s', (route) => {
  it('links the SVG favicon and the 180×180 apple touch icon', async () => {
    const serverDocument = await fetchServerDocument(route)

    const favicon = readSingleElement(serverDocument, 'link[rel="icon"]')
    expect(favicon.getAttribute('href')).toBe('/favicon.svg')
    expect(favicon.getAttribute('type')).toBe('image/svg+xml')
    const appleTouchIcon = readSingleElement(serverDocument, 'link[rel="apple-touch-icon"]')
    expect(appleTouchIcon.getAttribute('href')).toBe('/apple-touch-icon.png')
    expect(appleTouchIcon.getAttribute('sizes')).toBe('180x180')
  })
})

describe.each([
  {
    route: '/',
    url: SITE_URL,
    description: DESCRIPTIONS.en,
    image: `${SITE_URL}/share-image-en.png`,
    imageAlt: 'N2Shader logo and name, with the slogan: Every website is a one-of-a-kind piece of digital art.',
  },
  {
    route: '/es',
    url: `${SITE_URL}/es`,
    description: DESCRIPTIONS.es,
    image: `${SITE_URL}/share-image-es.png`,
    imageAlt: 'Logotipo y nombre de N2Shader, con el lema: Cada sitio web es una obra de arte digital única.',
  },
])('share card tags at $route (ADR-0003)', ({ route, url, description, image, imageAlt }) => {
  it('gives Open Graph the localized card with an absolute 1200×630 PNG', async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(readMetaContents(serverDocument, 'property', 'og:type')).toEqual(['website'])
    expect(readMetaContents(serverDocument, 'property', 'og:site_name')).toEqual(['N2Shader'])
    expect(readMetaContents(serverDocument, 'property', 'og:title')).toEqual(['N2Shader'])
    expect(readMetaContents(serverDocument, 'property', 'og:description')).toEqual([description])
    expect(readMetaContents(serverDocument, 'property', 'og:url')).toEqual([url])
    expect(readMetaContents(serverDocument, 'property', 'og:image')).toEqual([image])
    expect(readMetaContents(serverDocument, 'property', 'og:image:type')).toEqual(['image/png'])
    expect(readMetaContents(serverDocument, 'property', 'og:image:width')).toEqual(['1200'])
    expect(readMetaContents(serverDocument, 'property', 'og:image:height')).toEqual(['630'])
    expect(readMetaContents(serverDocument, 'property', 'og:image:alt')).toEqual([imageAlt])
  })

  it('asks X for the large image card and leaves the rest to the Open Graph tags', async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(readMetaContents(serverDocument, 'name', 'twitter:card')).toEqual(['summary_large_image'])
    expect(readMetaContents(serverDocument, 'name', 'twitter:image:alt')).toEqual([imageAlt])
  })
})

// Skipped while the locale switch is hidden (commented out in app.vue, 2026-11-20); drop `.skip` when it comes back.
describe.skip.each([
  {
    route: '/',
    otherLocale: { href: '/es', lang: 'es-ES', code: 'ES', accessibleName: 'ES, Español: cambiar el idioma de la página' },
  },
  {
    route: '/es',
    otherLocale: { href: '/', lang: 'en-GB', code: 'EN', accessibleName: 'EN, English: change the page language' },
  },
])('locale switch at $route', ({ route, otherLocale }) => {
  it('links to the other locale outside <main>, named and explained in that locale', async () => {
    const serverDocument = await fetchServerDocument(route)

    const localeSwitch = readSingleElement(serverDocument, 'body a[hreflang]')
    expect(localeSwitch.getAttribute('href')).toBe(otherLocale.href)
    expect(localeSwitch.getAttribute('hreflang')).toBe(otherLocale.lang)
    expect(localeSwitch.getAttribute('lang')).toBe(otherLocale.lang)
    // Starts with the visible label, so voice control can say what it sees (2.5.3).
    expect(localeSwitch.textContent?.trim()).toBe(otherLocale.accessibleName)
    expect(localeSwitch.textContent?.trim().startsWith(otherLocale.code)).toBe(true)
    expect(localeSwitch.closest('main')).toBeNull()
    // The flag is decorative: the text already names the language.
    expect(localeSwitch.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    // A paper-coloured chip outside the difference blend, so the flag keeps its colours (ADR-0009).
    expect(localeSwitch.closest('.content-layer')).toBeNull()
  })
})
