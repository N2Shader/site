import {
  CONTENT_REVEAL_PENDING_SCRIPT,
  isContentRevealPending,
} from '~/reveal/ContentRevealPendingScript'

/**
 * Plays the content reveal (app/reveal/ContentReveal.ts) once, on the first load of the landing page. The inline
 * head script hides the parts before the first paint and starts the description's CSS rise. The GSAP part splits the
 * company name into letters, not lines, so it doesn't wait for the web font. A later client-side locale switch
 * remounts the page without the pending state, so the reveal doesn't play again. Reduced motion never gets the
 * pending state, so nothing moves (ADR-0005).
 */
export const useContentReveal = () => {
  useHead({
    script: [{ key: 'content-reveal-pending', innerHTML: CONTENT_REVEAL_PENDING_SCRIPT, tagPosition: 'head' }],
  })

  let stopContentReveal: (() => void) | undefined
  let isPageUnmounted = false

  onMounted(async () => {
    if (!isContentRevealPending()) return
    const { playContentReveal } = await import('~/reveal/ContentReveal')
    // The pending state may have timed out while GSAP loaded; then the content already shows and stays put.
    if (isPageUnmounted || !isContentRevealPending()) return
    stopContentReveal = playContentReveal()
  })

  onBeforeUnmount(() => {
    isPageUnmounted = true
    stopContentReveal?.()
  })
}
