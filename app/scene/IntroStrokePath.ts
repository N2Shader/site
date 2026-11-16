import type { BrushPoint } from './BrushPointer'
import { SceneSettings } from './SceneSettings'
import type { SceneViewport } from './SceneViewport'

export type IntroStrokePath = {
  durationSeconds: number
  /** Points along the stroke in CSS pixels, from start to end. */
  points: BrushPoint[]
}

type ScreenSize = Pick<SceneViewport, 'width' | 'height'>

/** The value `share` (0–1) of the way from `from` to `to`. */
const lerpBetween = (from: number, to: number, share: number) => from + (to - from) * share

/** Which of `count` samples `progress` (0–1) falls after, and how far it is towards the next one. */
const findSampleSegment = (count: number, progress: number) => {
  const position = Math.min(1, Math.max(0, progress)) * (count - 1)
  const index = Math.min(Math.floor(position), count - 2)
  return { index, share: position - index }
}

/** Smooth 1D value noise in -1–1 through random knots, sampled at `progress` 0–1. */
const createBendNoise = (random: () => number) => {
  const knots = Array.from({ length: SceneSettings.introStroke.bendKnots + 1 }, () => random() * 2 - 1)
  return (progress: number) => {
    const { index, share } = findSampleSegment(knots.length, progress)
    const smoothShare = share * share * (3 - 2 * share)
    return lerpBetween(knots[index]!, knots[index + 1]!, smoothShare)
  }
}

/** Where the straight line under the stroke runs: its middle near the screen centre, its ends `span` apart. */
const pickStrokeChord = (screen: ScreenSize, shortSide: number, random: () => number) => {
  const { minSpan, maxSpan, maxCentreOffset } = SceneSettings.introStroke
  const offsetAngle = random() * Math.PI * 2
  const offset = random() * maxCentreOffset * shortSide
  const middle = {
    x: screen.width / 2 + Math.cos(offsetAngle) * offset,
    y: screen.height / 2 + Math.sin(offsetAngle) * offset,
  }
  const heading = random() * Math.PI * 2
  const halfSpan = (lerpBetween(minSpan, maxSpan, random()) * shortSide) / 2
  const along = { x: Math.cos(heading) * halfSpan, y: Math.sin(heading) * halfSpan }
  return {
    start: { x: middle.x - along.x, y: middle.y - along.y },
    end: { x: middle.x + along.x, y: middle.y + along.y },
    /** Unit vector across the line, the way the noise bends it. */
    across: { x: -Math.sin(heading), y: Math.cos(heading) },
  }
}

/** The point `progress` (0–1) of the way along `points`, blending the two samples it falls between. */
export const findPointAlongPath = (points: BrushPoint[], progress: number): BrushPoint => {
  const { index, share } = findSampleSegment(points.length, progress)
  const from = points[index]!
  const to = points[index + 1]!
  return { x: lerpBetween(from.x, to.x, share), y: lerpBetween(from.y, to.y, share) }
}

/**
 * The intro stroke for this visit: one random continuous path, different every time `random` differs. The noise bends
 * it away from a straight line and fades to nothing at both ends, so the ends stay exactly `span` apart.
 */
export const createIntroStrokePath = (screen: ScreenSize, random: () => number = Math.random): IntroStrokePath => {
  const { minSeconds, maxSeconds, maxBend, samples } = SceneSettings.introStroke
  const shortSide = Math.min(screen.width, screen.height)
  const durationSeconds = lerpBetween(minSeconds, maxSeconds, random())
  const { start, end, across } = pickStrokeChord(screen, shortSide, random)
  const bendNoise = createBendNoise(random)
  const bendSize = maxBend * shortSide
  const points = Array.from({ length: samples }, (_, index) => {
    const progress = index / (samples - 1)
    const bend = bendNoise(progress) * Math.sin(Math.PI * progress) * bendSize
    return {
      x: lerpBetween(start.x, end.x, progress) + across.x * bend,
      y: lerpBetween(start.y, end.y, progress) + across.y * bend,
    }
  })
  return { durationSeconds, points }
}
