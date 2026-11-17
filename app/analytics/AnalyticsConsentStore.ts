/**
 * The visitor's analytics-cookie choice, kept in localStorage. Storing the choice itself needs no consent: it's
 * strictly necessary to respect it. The choice expires after 12 months, then the banner asks again (the AEPD and ICO
 * advise re-asking periodically, at most every 24 months).
 */
export type AnalyticsConsentChoice = 'granted' | 'denied'

interface StoredAnalyticsConsent {
  choice: AnalyticsConsentChoice
  decidedAt: number
}

const ANALYTICS_CONSENT_STORAGE_KEY = 'n2shader-analytics-consent'
const ANALYTICS_CONSENT_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000

const isStoredAnalyticsConsent = (value: unknown): value is StoredAnalyticsConsent => {
  const candidate = value as Partial<StoredAnalyticsConsent> | null
  return (
    (candidate?.choice === 'granted' || candidate?.choice === 'denied') && typeof candidate.decidedAt === 'number'
  )
}

const parseStoredAnalyticsConsent = (storedText: string | null): StoredAnalyticsConsent | null => {
  if (!storedText) return null
  try {
    const parsed: unknown = JSON.parse(storedText)
    return isStoredAnalyticsConsent(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** The choice still in force, or null when the visitor hasn't chosen, the choice expired or storage is blocked. */
export const readAnalyticsConsentChoice = (): AnalyticsConsentChoice | null => {
  try {
    const storedConsent = parseStoredAnalyticsConsent(localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY))
    if (!storedConsent || Date.now() - storedConsent.decidedAt > ANALYTICS_CONSENT_LIFETIME_MS) return null
    return storedConsent.choice
  } catch {
    return null
  }
}

/** Saves the choice. With storage blocked it still holds for this page view, and the banner asks again next time. */
export const saveAnalyticsConsentChoice = (choice: AnalyticsConsentChoice) => {
  const storedConsent: StoredAnalyticsConsent = { choice, decidedAt: Date.now() }
  try {
    localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, JSON.stringify(storedConsent))
  } catch {
    // Storage blocked (private mode, policy): nothing to keep.
  }
}
