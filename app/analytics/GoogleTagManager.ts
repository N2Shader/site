/**
 * The owner's Google Tag Manager container, which holds the Google Analytics tag (supplied 2026-11-17, ADR-0006).
 * It's only loaded once the visitor accepts analytics cookies (AnalyticsConsentBanner.vue). netlify.toml's CSP
 * allows Google's tag and analytics hosts for it.
 */
export const GOOGLE_TAG_MANAGER_ID = 'GTM-PFX7ZQ43'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...commandArguments: unknown[]) => void
  }
}

const GOOGLE_TAG_MANAGER_SCRIPT_SELECTOR = 'script[data-google-tag-manager]'

/** Cookies Google Analytics sets: `_ga`, `_ga_<id>`, and the older `_gid` / `_gat`. */
const GOOGLE_ANALYTICS_COOKIE_PATTERN = /^_(ga|gid|gat)(_|$)/

/**
 * The owner's snippet, run on consent. Google's tag runtime only reads an `arguments` object pushed to the dataLayer
 * (not an array), and arrow functions have no `arguments`, so `gtag` stays a function expression.
 * Consent Mode gets analytics storage only: the banner asks for nothing else.
 */
const defineGtag = () => {
  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.gtag('js', new Date())
}

const appendGoogleTagManagerScript = () => {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_MANAGER_ID}`
  script.dataset.googleTagManager = ''
  document.head.append(script)
}

/** Loads the container once per page view; a second call does nothing. */
export const loadGoogleTagManager = () => {
  if (document.querySelector(GOOGLE_TAG_MANAGER_SCRIPT_SELECTOR)) return
  defineGtag()
  appendGoogleTagManagerScript()
}

/** Expires a cookie on the host and on every parent domain, since GA picks the highest domain it can set. */
const expireCookieByName = (cookieName: string) => {
  const hostnameParts = location.hostname.split('.')
  const cookieDomains = hostnameParts.map((_, index) => hostnameParts.slice(index).join('.'))
  const expiry = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  document.cookie = expiry
  for (const cookieDomain of cookieDomains) document.cookie = `${expiry}; domain=.${cookieDomain}`
}

/** Deletes the Google Analytics cookies after the visitor withdraws consent. */
export const removeGoogleAnalyticsCookies = () => {
  const cookieNames = document.cookie.split(';').map((cookie) => cookie.split('=')[0]!.trim())
  cookieNames.filter((cookieName) => GOOGLE_ANALYTICS_COOKIE_PATTERN.test(cookieName)).forEach(expireCookieByName)
}
