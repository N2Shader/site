// The landing page's search result and share card tags, per locale (ADR-0003).
// canonical, hreflang, og:url and og:locale come from @nuxtjs/i18n in app.vue (ADR-0002), so they aren't repeated here.

const SHARE_IMAGE_WIDTH = 1200
const SHARE_IMAGE_HEIGHT = 630

// The placeholder share images in public/, one per locale, until the real one is designed after the scene.
const buildShareImageUrl = (siteUrl: string, localeCode: string) =>
  new URL(`/share-image-${localeCode}.png`, siteUrl).href

export const useLandingPageMeta = () => {
  const { t, locale } = useI18n()
  const siteConfig = useSiteConfig()
  const readDescription = () => t('landingPage.description')
  const readShareImageAlt = () => t('shareImage.alt')

  useSeoMeta({
    // The company name alone, the same in both locales (owner's choice, ticket 03).
    title: siteConfig.name,
    description: readDescription,
    ogType: 'website',
    ogSiteName: siteConfig.name,
    ogTitle: siteConfig.name,
    ogDescription: readDescription,
    ogImage: () => buildShareImageUrl(siteConfig.url, locale.value),
    ogImageType: 'image/png',
    ogImageWidth: SHARE_IMAGE_WIDTH,
    ogImageHeight: SHARE_IMAGE_HEIGHT,
    ogImageAlt: readShareImageAlt,
    // X reads the title, description and image from the Open Graph tags; only the card type and alt are its own.
    twitterCard: 'summary_large_image',
    twitterImageAlt: readShareImageAlt,
  })
}
