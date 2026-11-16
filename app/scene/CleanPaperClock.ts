import { SceneSettings } from './SceneSettings'

/**
 * Simulated seconds for the wettest cell (water 1) to dry. The settle pass takes `(share × water + perSecond)` of water
 * per second, so water follows `w' = -(s·w + c)` and reaches zero at `ln(1 + s/c) / s`.
 */
const measureDryingSeconds = () => {
  // Widened from the settings' literal types: the dev tuning panel can set the share to 0, which would divide by zero.
  const share: number = SceneSettings.ink.evaporationShare
  const perSecond: number = SceneSettings.ink.evaporationPerSecond
  if (share === 0) return 1 / perSecond
  return Math.log(1 + share / perSecond) / share
}

/**
 * Simulated seconds after the brush last laid ink until the paper is clean again: the ink dries, holds, and fades
 * fully (the fade takes `maxDeposit` away over `fadeSeconds`, so the darkest cell is gone by then).
 */
const measureSecondsUntilClean = () => {
  const { holdSeconds, fadeSeconds } = SceneSettings.ink
  return measureDryingSeconds() + holdSeconds + fadeSeconds + SceneSettings.cleanPaperMarginSeconds
}

/**
 * Says when the paper is clean (no wet ink, all dried ink faded) without reading the GPU back. It counts the same
 * simulated seconds the ink simulation steps by, so slow, clamped frames slow it down just as they slow the ink. It reads
 * the settings on every check, so a retune from the dev tuning panel moves the clean time at once.
 */
export const createCleanPaperClock = () => {
  let secondsSinceInk = Number.POSITIVE_INFINITY

  return {
    /** One simulation frame passed. `laidInk` is whether the brush laid ink in it. */
    advanceFrame: (frameSeconds: number, laidInk: boolean) => {
      secondsSinceInk = laidInk ? 0 : secondsSinceInk + frameSeconds
    },
    /** The ink was wiped: fresh paper after a resize, or the still frame. */
    markPaperClean: () => {
      secondsSinceInk = Number.POSITIVE_INFINITY
    },
    /** No wet ink is left and all dried ink has faded. */
    isPaperClean: () => secondsSinceInk >= measureSecondsUntilClean(),
  }
}

export type CleanPaperClock = ReturnType<typeof createCleanPaperClock>
