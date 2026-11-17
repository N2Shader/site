import type { AnalyticsConsentChoice } from '~/analytics/AnalyticsConsentStore'
import { readAnalyticsConsentChoice, saveAnalyticsConsentChoice } from '~/analytics/AnalyticsConsentStore'
import { loadGoogleTagManager, removeGoogleAnalyticsCookies } from '~/analytics/GoogleTagManager'

/**
 * Google Analytics only after consent (ADR-0006): nothing loads and no cookie is set until the visitor accepts.
 * The choice lives in the browser, so it's read on mount; the prerendered HTML has no banner (`isBannerOpen` false).
 * Withdrawing is as easy as accepting: the "Cookies" button reopens the banner.
 */
export const useAnalyticsConsent = () => {
  const analyticsConsentChoice = ref<AnalyticsConsentChoice | null>(null)
  const isBannerOpen = ref(false)
  const hasReadStoredChoice = ref(false)

  onMounted(() => {
    analyticsConsentChoice.value = readAnalyticsConsentChoice()
    hasReadStoredChoice.value = true
    if (analyticsConsentChoice.value === 'granted') loadGoogleTagManager()
    isBannerOpen.value = analyticsConsentChoice.value === null
  })

  const acceptAnalytics = () => {
    saveAnalyticsConsentChoice('granted')
    analyticsConsentChoice.value = 'granted'
    isBannerOpen.value = false
    loadGoogleTagManager()
  }

  /** Withdrawing after accepting: GA is already running in this page, so its cookies go and the page reloads without it. */
  const rejectAnalytics = () => {
    const wasGranted = analyticsConsentChoice.value === 'granted'
    saveAnalyticsConsentChoice('denied')
    analyticsConsentChoice.value = 'denied'
    isBannerOpen.value = false
    if (!wasGranted) return
    removeGoogleAnalyticsCookies()
    location.reload()
  }

  const reopenBanner = () => {
    isBannerOpen.value = true
  }

  return { analyticsConsentChoice, isBannerOpen, hasReadStoredChoice, acceptAnalytics, rejectAnalytics, reopenBanner }
}
