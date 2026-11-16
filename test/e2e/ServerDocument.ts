import { $fetch } from '@nuxt/test-utils/e2e'
import { Window } from 'happy-dom'

// Reads a route's server HTML into a DOM, without running its scripts or styles: what crawlers get (ADR-0001).
export const fetchServerDocument = async (route: string) => {
  const html = await $fetch<string>(route, { responseType: 'text' })
  const window = new Window({
    url: 'http://localhost/',
    settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true },
  })
  window.document.write(html)
  return window.document
}
