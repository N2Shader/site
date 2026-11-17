/**
 * Timings of the content reveal (ContentReveal.ts), in seconds. Each part starts at its own offset from the start of
 * the reveal, not after the part before it ends, so the parts overlap into one staggered entrance.
 */
export const ContentRevealSettings = {
  logo: {
    startAt: 0,
    durationSeconds: 1.1,
    // Between one logo path starting to draw and the next.
    staggerSeconds: 0.12,
    ease: 'power2.inOut',
  },
  companyName: {
    startAt: 0.15,
    durationSeconds: 0.8,
    staggerSeconds: 0.08,
    ease: 'power1.out',
  },
  // The description's rise is a CSS animation from the first paint (base.css), not part of this timeline.
  // The wipes bring elements in, so they ease out: fast at first, settling into place.
  contactDetails: {
    startAt: 0.9,
    durationSeconds: 0.6,
    staggerSeconds: 0.1,
    ease: 'power2.out',
  },
  localeSwitch: {
    startAt: 1.1,
    durationSeconds: 0.6,
    ease: 'power2.out',
  },
  /*
   * If the reveal hasn't started this long after the first paint (the app's JavaScript failed or is very slow),
   * the page shows the content unrevealed rather than leave it hidden (ContentRevealPendingScript.ts).
   */
  pendingTimeoutMilliseconds: 4000,
} as const
