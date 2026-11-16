// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { Window } from 'happy-dom'

// Builds and serves the app once, then reads the server HTML: what crawlers get (ADR-0001).
await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)) })

const SITE_URL = 'https://n2shader.com'

const fetchServerDocument = async (route: string) => {
  const html = await $fetch<string>(route, { responseType: 'text' })
  const window = new Window({
    url: 'http://localhost/',
    settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
  })
  window.document.write(html)
  return window.document
}

describe.each([
  { route: '/', lang: 'en-GB', description: 'At N2Shader, every website is a one-of-a-kind piece of digital art. We build immersive experiences that make customers feel something before they read a single word, because that is what they remember.', country: 'England' },
  { route: '/es', lang: 'es-ES', description: 'En N2Shader, cada sitio web es una obra de arte digital única. Creamos experiencias inmersivas que hacen sentir algo a los clientes antes de que lean una sola palabra, porque eso es lo que recuerdan.', country: 'Inglaterra' },
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

const readMetaPropertyContents = (serverDocument: Document, property: string) =>
  [...serverDocument.querySelectorAll(`meta[property="${property}"]`)].map((metaTag) => metaTag.getAttribute('content'))

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
    expect(readMetaPropertyContents(serverDocument, 'og:locale')).toEqual([ogLocale])
    expect(readMetaPropertyContents(serverDocument, 'og:locale:alternate')).toEqual([ogLocaleAlternate])
  })
})

describe.each([
  {
    route: '/',
    otherLocale: { href: '/es', lang: 'es-ES', name: 'Español', accessibleName: 'Español: cambiar el idioma de la página' },
  },
  {
    route: '/es',
    otherLocale: { href: '/', lang: 'en-GB', name: 'English', accessibleName: 'English: change the page language' },
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
    expect(localeSwitch.textContent?.trim().startsWith(otherLocale.name)).toBe(true)
    expect(localeSwitch.closest('main')).toBeNull()
    // It inverts over the ink like the rest of the content layer (ADR-0009).
    expect(localeSwitch.classList.contains('content-layer')).toBe(true)
  })
})
