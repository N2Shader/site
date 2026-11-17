import { ContentRevealSettings } from './ContentRevealSettings'

/**
 * The content reveal's state on `<html data-content-reveal>`. "pending" hides the logo, the contact chips and the
 * locale switch, and paints the company name in the paper colour (base.css), from the first paint until the reveal
 * takes over, so the prerendered text doesn't flash before it plays. Without the attribute (reduced motion, no
 * JavaScript, the reveal done or timed out) the content just shows.
 */
export const CONTENT_REVEAL_ATTRIBUTE = 'data-content-reveal'
export const CONTENT_REVEAL_PENDING = 'pending'

/**
 * Set with "pending", and kept until the description's CSS rise (base.css) has ended, so the rise starts at the first
 * paint and runs to its end after the pending state is gone. Dropped then, so a later client-side locale switch
 * doesn't rise the new description again.
 */
export const CONTENT_REVEAL_PLAYING_ATTRIBUTE = 'data-content-reveal-playing'

/** The description's rise keyframes in base.css. */
export const DESCRIPTION_RISE_ANIMATION_NAME = 'content-reveal-description-rise'

/** Each revealed element carries `data-content-reveal-part` with one of these. */
export type ContentRevealPart = 'logo' | 'company-name' | 'description' | 'contact-details' | 'locale-switch'

export const isContentRevealPending = () =>
  document.documentElement.getAttribute(CONTENT_REVEAL_ATTRIBUTE) === CONTENT_REVEAL_PENDING

export const endContentRevealPending = () => document.documentElement.removeAttribute(CONTENT_REVEAL_ATTRIBUTE)

/**
 * Inline in the `<head>`, so it runs before the first paint. Visitors who ask for reduced motion never get the
 * pending state (ADR-0005). The timeout drops it if the app never starts the reveal, and so does the first focus
 * (a Tab press before the reveal starts), so a keyboard user never lands on a hidden link.
 */
export const CONTENT_REVEAL_PENDING_SCRIPT = `(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const root = document.documentElement
  root.setAttribute('${CONTENT_REVEAL_ATTRIBUTE}', '${CONTENT_REVEAL_PENDING}')
  root.setAttribute('${CONTENT_REVEAL_PLAYING_ATTRIBUTE}', '')
  const endPending = () => {
    if (root.getAttribute('${CONTENT_REVEAL_ATTRIBUTE}') === '${CONTENT_REVEAL_PENDING}') root.removeAttribute('${CONTENT_REVEAL_ATTRIBUTE}')
  }
  const endPlaying = () => root.removeAttribute('${CONTENT_REVEAL_PLAYING_ATTRIBUTE}')
  setTimeout(() => {
    endPending()
    endPlaying()
  }, ${ContentRevealSettings.pendingTimeoutMilliseconds})
  addEventListener('focusin', endPending, { once: true })
  addEventListener('animationend', (event) => {
    if (event.animationName === '${DESCRIPTION_RISE_ANIMATION_NAME}') endPlaying()
  })
})()`
