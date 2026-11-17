import { $fetch } from '@nuxt/test-utils/e2e'
import { Window } from 'happy-dom'

// Reads a route's server HTML into a DOM, without loading its script files or styles: what crawlers get (ADR-0001).
// `runInlineScripts` turns on script evaluation, so a test can inject its own script (axe-core). The page's own inline
// scripts (the Nuxt payload) then run too; script files still never load.
export const fetchServerDocument = async (route: string, { runInlineScripts = false } = {}) => {
  const html = await $fetch<string>(route, { responseType: 'text' })
  const window = new Window({
    url: 'http://localhost/',
    settings: {
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
      enableJavaScriptEvaluation: runInlineScripts,
      suppressInsecureJavaScriptEnvironmentWarning: runInlineScripts,
    },
  })
  window.document.write(html)
  return window.document
}
