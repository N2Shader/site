import { SceneSettings } from './SceneSettings'

/** A half float has 11 significant bits, so whole multiples of a power of two are exact up to 2048 of them. */
const exactHalfFloatSteps = 2048

/** Age at which the darkest dried ink has faded back to clean paper: it holds, then fades. */
export const measureFadedInkAgeSeconds = () => SceneSettings.ink.holdSeconds + SceneSettings.ink.fadeSeconds

/** Oldest age the ink state keeps for a cell: a second past the whole fade, so faded ink stays faded. */
export const measureInkAgeCapSeconds = () => measureFadedInkAgeSeconds() + 1

/**
 * The length of one age tick: the shortest power of two whose multiples are all exact in a half float up to the age cap
 * (1/64 s at the default 8 s hold and 22 s fade). Ages that grow in whole ticks never round, at any refresh rate.
 */
export const measureInkAgeTickSeconds = () => 2 ** Math.ceil(Math.log2(measureInkAgeCapSeconds() / exactHalfFloatSteps))

/**
 * Turns frame times into whole age ticks for the settle pass. A cell's age in the half-float ink state grows by these
 * ticks instead of by the frame time, because a 144 Hz frame (about 0.007 s) is under half a half-float step past 16 s
 * and would round away, so the age would stop and the dried ink would never fade (ticket 18).
 */
export const createInkAgeClock = () => {
  let untickedSeconds = 0

  return {
    /** Seconds the dried ink ages this frame: the whole ticks that fit in the time not yet handed out. */
    advanceFrame: (frameSeconds: number) => {
      const tickSeconds = measureInkAgeTickSeconds()
      untickedSeconds += frameSeconds
      const agingSeconds = Math.floor(untickedSeconds / tickSeconds) * tickSeconds
      untickedSeconds -= agingSeconds
      return agingSeconds
    },
  }
}

export type InkAgeClock = ReturnType<typeof createInkAgeClock>
