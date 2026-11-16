// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createIntroStrokePath, findPointAlongPath } from '../../app/scene/IntroStrokePath'
import { SceneSettings } from '../../app/scene/SceneSettings'

/** Small seeded PRNG (mulberry32), so every visit in a test is a different but repeatable one. */
const createSeededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const desktop = { width: 1440, height: 900 }
const phone = { width: 390, height: 844 }

/** A hundred different visits, plus the two extremes a random source can return. */
const visitRandoms = () => [
  ...Array.from({ length: 100 }, (_, seed) => createSeededRandom(seed + 1)),
  () => 0,
  () => 0.999999,
]

describe('createIntroStrokePath', () => {
  it('lasts between 1.2 and 2 seconds', () => {
    for (const random of visitRandoms()) {
      const { durationSeconds } = createIntroStrokePath(desktop, random)
      expect(durationSeconds).toBeGreaterThanOrEqual(1.2)
      expect(durationSeconds).toBeLessThanOrEqual(2)
    }
  })

  it.each([{ name: 'desktop', screen: desktop }, { name: 'phone', screen: phone }])('spans 40 to 70 percent of the short side on a $name', ({ screen }) => {
    const shortSide = Math.min(screen.width, screen.height)
    for (const random of visitRandoms()) {
      const { points } = createIntroStrokePath(screen, random)
      const start = points[0]!
      const end = points.at(-1)!
      const span = Math.hypot(end.x - start.x, end.y - start.y) / shortSide
      expect(span).toBeGreaterThanOrEqual(0.4 - 1e-9)
      expect(span).toBeLessThanOrEqual(0.7 + 1e-9)
    }
  })

  it('starts off-centre', () => {
    const shortSide = Math.min(desktop.width, desktop.height)
    for (const random of visitRandoms()) {
      const [start] = createIntroStrokePath(desktop, random).points
      const fromCentre = Math.hypot(start!.x - desktop.width / 2, start!.y - desktop.height / 2) / shortSide
      expect(fromCentre).toBeGreaterThan(0.1)
    }
  })

  it.each([{ name: 'desktop', screen: desktop }, { name: 'phone', screen: phone }])('keeps the whole brush on a $name screen', ({ screen }) => {
    const brushRadius = SceneSettings.brush.radiusOfShortSide * Math.min(screen.width, screen.height)
    for (const random of visitRandoms()) {
      for (const { x, y } of createIntroStrokePath(screen, random).points) {
        expect(x).toBeGreaterThanOrEqual(brushRadius)
        expect(x).toBeLessThanOrEqual(screen.width - brushRadius)
        expect(y).toBeGreaterThanOrEqual(brushRadius)
        expect(y).toBeLessThanOrEqual(screen.height - brushRadius)
      }
    }
  })

  it('is one continuous path with no jumps', () => {
    const shortSide = Math.min(desktop.width, desktop.height)
    for (const random of visitRandoms()) {
      const { points } = createIntroStrokePath(desktop, random)
      const steps = points.slice(1).map((point, index) => Math.hypot(point.x - points[index]!.x, point.y - points[index]!.y))
      expect(Math.max(...steps) / shortSide).toBeLessThan(0.02)
    }
  })

  it('is different on every visit', () => {
    const firstVisit = createIntroStrokePath(desktop, createSeededRandom(7)).points
    const secondVisit = createIntroStrokePath(desktop, createSeededRandom(8)).points
    expect(secondVisit).not.toEqual(firstVisit)
  })
})

describe('findPointAlongPath', () => {
  const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 20 }]

  it('is at the start at 0, at the end at 1, and between neighbouring points in between', () => {
    expect(findPointAlongPath(points, 0)).toEqual({ x: 0, y: 0 })
    expect(findPointAlongPath(points, 1)).toEqual({ x: 10, y: 20 })
    expect(findPointAlongPath(points, 0.25)).toEqual({ x: 5, y: 0 })
    expect(findPointAlongPath(points, 0.75)).toEqual({ x: 10, y: 10 })
  })
})
