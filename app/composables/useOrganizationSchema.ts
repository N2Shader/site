// N2Shader as the site's schema.org identity (`#identity`), per locale (ADR-0003).
// nuxt-schema-org's i18n defaults add the WebSite and WebPage nodes; this adds the Organization they point at,
// and the two WebPage properties the defaults leave out: `about` (they only link a config-level identity, which
// can't be localized) and `inLanguage` (the WebPage resolver doesn't inherit it).

// N2Shader's public profiles: only here, never as visible links (ADR-0003). Owner-supplied, 2026-11-16.
const PUBLIC_PROFILE_URLS = ['https://github.com/N2Shader', 'https://x.com/n2shader']

// public/logo.png: the logo as a PNG every search and answer engine reads, apart from the favicon (ticket 08).
const ORGANIZATION_LOGO = { url: '/logo.png', width: 512, height: 512 }

export const useOrganizationSchema = () => {
  const { t, localeProperties } = useI18n()
  const siteConfig = useSiteConfig()
  const contactDetails = useContactDetails()
  const readOfficeAddressParts = () => contactDetails.value.officeAddressParts

  useSchemaOrg([
    defineOrganization({
      name: siteConfig.name,
      logo: ORGANIZATION_LOGO,
      slogan: () => t('landingPage.slogan'),
      description: () => t('landingPage.description'),
      email: () => contactDetails.value.email,
      telephone: () => contactDetails.value.phoneE164,
      // A typed PostalAddress, not a LocalBusiness: clients don't visit, so no street, postcode or hours (ADR-0003).
      address: {
        '@type': 'PostalAddress',
        'addressLocality': () => readOfficeAddressParts().locality,
        'addressRegion': () => readOfficeAddressParts().region,
        'addressCountry': () => readOfficeAddressParts().countryCode,
      },
      sameAs: PUBLIC_PROFILE_URLS,
    }),
    defineWebPage({
      about: { '@id': '#identity' },
      inLanguage: () => localeProperties.value.language,
    }),
  ])
}
