// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { DESCRIPTIONS, SITE_URL } from './LandingPageFixtures'
import { fetchServerDocument } from './ServerDocument'

// The JSON-LD graph in the server HTML, as search and answer engines read it (ADR-0003).
await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)) })

type SchemaNode = Record<string, unknown> & { '@id'?: string, '@type'?: string | string[] }

const readSchemaGraph = (serverDocument: Document): SchemaNode[] =>
  [...serverDocument.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) => {
    const jsonLd = JSON.parse(script.textContent ?? '{}')
    return jsonLd['@graph'] ?? [jsonLd]
  })

const hasSchemaType = (node: SchemaNode, schemaType: string) =>
  ([] as unknown[]).concat(node['@type']).includes(schemaType)

// The one node of that type; fails the test if there are none or several.
const readSingleSchemaNode = (schemaGraph: SchemaNode[], schemaType: string) => {
  const matchingNodes = schemaGraph.filter((node) => hasSchemaType(node, schemaType))
  expect(matchingNodes, schemaType).toHaveLength(1)
  return matchingNodes[0]!
}

// A property may hold the node itself or a `{ "@id" }` reference to a node elsewhere in the graph.
const resolveSchemaReference = (schemaGraph: SchemaNode[], propertyValue: unknown) => {
  const nodeOrReference = propertyValue as SchemaNode
  const isBareReference = nodeOrReference?.['@id'] !== undefined && Object.keys(nodeOrReference).length === 1
  return isBareReference ? schemaGraph.find((node) => node['@id'] === nodeOrReference['@id']) : nodeOrReference
}

describe.each([
  {
    route: '/',
    slogan: 'Every website is a one-of-a-kind piece of digital art.',
    description: DESCRIPTIONS.en,
  },
  {
    route: '/es',
    slogan: 'Cada sitio web es una obra de arte digital única.',
    description: DESCRIPTIONS.es,
  },
])('Organization JSON-LD at $route', ({ route, slogan, description }) => {
  it('names N2Shader with its logo, slogan, description and public profiles', async () => {
    const schemaGraph = readSchemaGraph(await fetchServerDocument(route))

    const organization = readSingleSchemaNode(schemaGraph, 'Organization')
    expect(organization.name).toBe('N2Shader')
    expect(organization.url).toBe(`${SITE_URL}/`)
    expect(resolveSchemaReference(schemaGraph, organization.logo)).toMatchObject({
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    })
    expect(organization.slogan).toBe(slogan)
    expect(organization.description).toBe(description)
    expect(organization.sameAs).toEqual(['https://github.com/N2Shader', 'https://x.com/n2shader'])
  })

  it('holds the same email, phone and office address the page shows', async () => {
    const serverDocument = await fetchServerDocument(route)
    const schemaGraph = readSchemaGraph(serverDocument)

    const organization = readSingleSchemaNode(schemaGraph, 'Organization')
    const visibleEmailHref = serverDocument.querySelector('main a[href^="mailto:"]')?.getAttribute('href')
    const visiblePhoneHref = serverDocument.querySelector('main a[href^="tel:"]')?.getAttribute('href')
    expect(`mailto:${organization.email}`).toBe(visibleEmailHref)
    expect(`tel:${organization.telephone}`).toBe(visiblePhoneHref)

    const officeAddress = resolveSchemaReference(schemaGraph, organization.address)
    expect(officeAddress).toMatchObject({
      '@type': 'PostalAddress',
      'addressLocality': 'Haworth',
      'addressRegion': 'West Yorkshire',
      'addressCountry': 'GB',
    })
    expect(officeAddress).not.toHaveProperty('streetAddress')
    expect(officeAddress).not.toHaveProperty('postalCode')
    const visibleOfficeAddress = serverDocument.querySelector('main address')?.textContent ?? ''
    expect(visibleOfficeAddress).toContain(`${officeAddress?.addressLocality}, ${officeAddress?.addressRegion}`)
  })
})

const IDENTITY_REFERENCE = { '@id': `${SITE_URL}/#identity` }

describe.each([
  { route: '/', siteUrl: `${SITE_URL}/`, language: 'en-GB' },
  { route: '/es', siteUrl: `${SITE_URL}/es`, language: 'es-ES' },
])('WebSite and WebPage JSON-LD at $route', ({ route, siteUrl, language }) => {
  it('describes the site and the page in the locale, published by and about the Organization', async () => {
    const serverDocument = await fetchServerDocument(route)
    const schemaGraph = readSchemaGraph(serverDocument)

    const webSite = readSingleSchemaNode(schemaGraph, 'WebSite')
    expect(webSite).toMatchObject({ name: 'N2Shader', url: siteUrl, inLanguage: language, publisher: IDENTITY_REFERENCE })

    const webPage = readSingleSchemaNode(schemaGraph, 'WebPage')
    expect(webPage).toMatchObject({
      // The page's own URL, written as its canonical link writes it.
      url: serverDocument.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      inLanguage: language,
      isPartOf: { '@id': webSite['@id'] },
      about: IDENTITY_REFERENCE,
    })
  })
})
