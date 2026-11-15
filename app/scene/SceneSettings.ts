/** Tuning constants for the background scene. Ticket 12 adds the ink simulation constants here. */
export const SceneSettings = {
  /** Neutral off-white paper. Must match `--paper` in base.css (the fallback backdrop). */
  paperColor: '#f4f2ee',
  maxPixelRatio: 2,
  resizeDebounceMs: 200,
  /** Longest wait for the browser to go idle before the scene loads anyway. */
  idleTimeoutMs: 2000,
} as const
