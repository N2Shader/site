// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { Window } from 'happy-dom'

// Builds and serves the app once, then reads the server HTML: what crawlers get (ADR-0001).
await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)) })

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
  { route: '/', lang: 'en', slogan: 'PLACEHOLDER: what n2Shader does, in one line.', country: 'Spain' },
  { route: '/es', lang: 'es', slogan: 'PLACEHOLDER: qué hace n2Shader, en una línea.', country: 'España' },
])('server HTML at $route', ({ route, lang, slogan, country }) => {
  it(`is in ${lang} and holds the name, slogan and three contact details`, async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(serverDocument.documentElement.getAttribute('lang')).toBe(lang)
    expect(serverDocument.querySelector('main h1')?.textContent).toBe('n2Shader')
    expect(serverDocument.querySelector('main p')?.textContent).toBe(slogan)
    expect(serverDocument.querySelector('a[href="mailto:hello@n2shader.com"]')).not.toBeNull()
    expect(serverDocument.querySelector('a[href="tel:+34600000000"]')).not.toBeNull()
    expect(serverDocument.querySelector('address')?.textContent).toContain(country)
  })

  it('ships with the scene pending, so the content layer is plain dark text until it runs (ADR-0009)', async () => {
    const serverDocument = await fetchServerDocument(route)

    expect(serverDocument.documentElement.getAttribute('data-background-scene')).toBe('pending')
    expect(serverDocument.querySelector('main')?.classList.contains('content-layer')).toBe(true)
  })
})
