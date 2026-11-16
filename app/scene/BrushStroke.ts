import type { BrushPoint } from './BrushPointer'
import { SceneSettings } from './SceneSettings'

/** What the brush lays in one frame: a short line between the last two pointer positions. */
export type BrushDab = {
  /** Ends of the line in CSS pixels. */
  from: BrushPoint
  to: BrushPoint
  /** Brush velocity in CSS pixels per second. */
  velocity: BrushPoint
  /** How much ink and water the brush lays, 0–1. Scales with speed, and with load. */
  strength: number
  /** How much ink is left in the brush, 0–1. A low load leaves dry-brush gaps. */
  load: number
}

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

const distanceBetween = (from: BrushPoint, to: BrushPoint) => Math.hypot(to.x - from.x, to.y - from.y)

/** Load the stroke spends over `travelled` short sides: long, fast strokes run the brush dry. */
const drainForTravel = (travelled: number, speedShare: number) => {
  const { drainPerShortSide, slowDrainShare } = SceneSettings.brush
  return travelled * drainPerShortSide * (slowDrainShare + (1 - slowDrainShare) * speedShare)
}

/**
 * Turns pointer moves into one brush dab per frame. The brush lays ink only while it moves, scaled by speed, and never
 * at rest. It runs dry on long, fast strokes and refills at rest. Lifting the pointer ends the stroke, so the next move
 * starts a new line instead of joining the old one.
 */
export const createBrushStroke = (initialShortSide: number) => {
  let shortSide = initialShortSide
  let load = 1
  let lastPoint: BrushPoint | null = null
  let pendingPoint: BrushPoint | null = null

  const refill = (frameSeconds: number) => {
    load = clampUnit(load + frameSeconds / SceneSettings.brush.refillSeconds)
  }

  const layDab = (from: BrushPoint, to: BrushPoint, frameSeconds: number): BrushDab | null => {
    const { fullInkSpeed, restSpeed } = SceneSettings.brush
    const travelled = distanceBetween(from, to) / shortSide
    const speed = travelled / frameSeconds
    if (speed < restSpeed) {
      refill(frameSeconds)
      return null
    }
    const speedShare = clampUnit(speed / fullInkSpeed)
    const loadBefore = load
    load = clampUnit(load - drainForTravel(travelled, speedShare))
    return {
      from,
      to,
      velocity: { x: (to.x - from.x) / frameSeconds, y: (to.y - from.y) / frameSeconds },
      strength: speedShare * (0.2 + 0.8 * loadBefore),
      load: loadBefore,
    }
  }

  /** The dab for this frame, or `null` when the brush lays nothing. */
  const takeFrameDab = (frameSeconds: number): BrushDab | null => {
    const to = pendingPoint
    pendingPoint = null
    if (!to) {
      refill(frameSeconds)
      return null
    }
    const from = lastPoint
    lastPoint = to
    return from ? layDab(from, to, frameSeconds) : null
  }

  return {
    moveTo: (point: BrushPoint) => {
      pendingPoint = point
    },
    lift: () => {
      lastPoint = null
      pendingPoint = null
    },
    /** A new sheet: the stroke ends and the brush is full again. */
    resetForSheet: (nextShortSide: number) => {
      shortSide = nextShortSide
      lastPoint = null
      pendingPoint = null
      load = 1
    },
    takeFrameDab,
  }
}

export type BrushStroke = ReturnType<typeof createBrushStroke>
