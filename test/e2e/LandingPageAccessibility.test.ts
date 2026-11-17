// @vitest-environment node
import { fileURLToPath } from 'node:url'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { fetchServerDocument } from './ServerDocument'

// Runs axe-core over the server HTML of each locale: the "axe zero violations" bar of done (ADR-0006).
await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)) })

// The page's window once the injected axe-core script has run.
type AxeWindow = { axe: typeof axe }

// happy-dom has no layout, so axe can't measure colour contrast here. Lighthouse measures it in a real browser, where
// it misreads the difference blend (ADR-0009).
const AXE_RUN_OPTIONS: axe.RunOptions = { rules: { 'color-contrast': { enabled: false } } }

// Only client-rendered UI (the analytics consent banner) is out of its reach: the server HTML doesn't hold it.
const listAxeViolationsByRoute = async (route: string) => {
  const serverDocument = await fetchServerDocument(route, { runInlineScripts: true })
  const serverWindow = serverDocument.defaultView as unknown as AxeWindow
  const axeScript = serverDocument.createElement('script')
  axeScript.textContent = axe.source
  serverDocument.head.append(axeScript)
  const axeResults = await serverWindow.axe.run(serverDocument, AXE_RUN_OPTIONS)
  return axeResults.violations.map((violation) => ({
    rule: violation.id,
    targets: violation.nodes.map((violatingNode) => violatingNode.target.join(' ')),
  }))
}

describe.each(['/', '/es'])('accessibility of the server HTML at %s', (route) => {
  it('has zero axe violations', async () => {
    expect(await listAxeViolationsByRoute(route)).toEqual([])
  })
})
