import type { BrushPoint } from './BrushPointer'
import { SceneSettings } from './SceneSettings'

/** What the brush lays in one frame: a short line between the last two pointer positions. */
export type BrushDab = {
  /** Ends of the line in CSS pixels. */
  from: BrushPoint
  to: BrushPoint
  /** Brush velocity in CSS pixels per second. */
  velocity: BrushPoint
  /** Share of the full pen size the line is drawn at, so fast strokes are thinner. The ink stays black at any width. */
  width: number
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

/** The width the pen thins to at `speedShare` of its thinnest speed: full at a crawl, `fastWidthShare` at speed. */
const measureWidthForSpeed = (speedShare: number) => 1 - (1 - SceneSettings.brush.fastWidthShare) * speedShare

/** Moves `width` towards `targetWidth`, so the line thins and thickens smoothly instead of jumping each frame. */
const easeWidth = (width: number, targetWidth: number, frameSeconds: number) =>
  width + (targetWidth - width) * (1 - Math.exp(-frameSeconds / SceneSettings.brush.widthEaseSeconds))

/**
 * Turns pointer moves into one brush dab per frame. The brush lays ink only while it moves, and never at rest. Speed
 * sets the line's width (faster is thinner), not how dark it is. It runs dry on long, fast strokes and refills at rest.
 * Lifting the pointer ends the stroke, so the next move starts a new line instead of joining the old one.
 */
export const createBrushStroke = (initialShortSide: number) => {
  let shortSide = initialShortSide
  let load = 1
  /** The current line width; `null` until the stroke's first dab, which starts at its own speed's width. */
  let width: number | null = null
  let lastPoint: BrushPoint | null = null
  let pendingPoint: BrushPoint | null = null

  const refill = (frameSeconds: number) => {
    load = clampUnit(load + frameSeconds / SceneSettings.brush.refillSeconds)
  }

  const endStroke = () => {
    lastPoint = null
    pendingPoint = null
    width = null
  }

  const layDab = (from: BrushPoint, to: BrushPoint, frameSeconds: number): BrushDab | null => {
    const { thinnestSpeed, restSpeed } = SceneSettings.brush
    const travelled = distanceBetween(from, to) / shortSide
    const speed = travelled / frameSeconds
    if (speed < restSpeed) {
      refill(frameSeconds)
      return null
    }
    const speedShare = clampUnit(speed / thinnestSpeed)
    const targetWidth = measureWidthForSpeed(speedShare)
    width = width === null ? targetWidth : easeWidth(width, targetWidth, frameSeconds)
    const loadBefore = load
    load = clampUnit(load - drainForTravel(travelled, speedShare))
    return {
      from,
      to,
      velocity: { x: (to.x - from.x) / frameSeconds, y: (to.y - from.y) / frameSeconds },
      width,
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
    lift: endStroke,
    /** A new sheet: the stroke ends and the brush is full again. */
    resetForSheet: (nextShortSide: number) => {
      shortSide = nextShortSide
      endStroke()
      load = 1
    },
    takeFrameDab,
  }
}

export type BrushStroke = ReturnType<typeof createBrushStroke>
