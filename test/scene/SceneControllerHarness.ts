import { vi } from 'vitest'
import { createSceneController } from '../../app/scene/SceneController'
import type { IntroStrokeBrush, SceneAdapter, SceneState } from '../../app/scene/SceneController'

/** Shared setup for the SceneController specs: a fake scene, motion setting and intro stroke, and window events. */
export const createFakeAdapter = (): SceneAdapter => ({
  resize: vi.fn(),
  renderStillFrame: vi.fn(),
  startLoop: vi.fn(),
  stopLoop: vi.fn(),
  moveBrush: vi.fn(),
  liftBrush: vi.fn(),
  dispose: vi.fn(),
})

export const createFakeMotionQuery = (reduce: boolean) => {
  const listeners = new Set<() => void>()
  const query = {
    matches: reduce,
    addEventListener: (_type: 'change', listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: 'change', listener: () => void) => listeners.delete(listener),
  }
  const setReducedMotion = (next: boolean) => {
    query.matches = next
    listeners.forEach(listener => listener())
  }
  return { query, setReducedMotion }
}

export const moveMouseTo = (x: number, y: number) => {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse' }))
}

/** A touch that goes down and up on the spot, with no move in between. */
export const tapAt = (x: number, y: number) => {
  const touch = { clientX: x, clientY: y, pointerId: 2, pointerType: 'touch' }
  window.dispatchEvent(new PointerEvent('pointerdown', touch))
  window.dispatchEvent(new PointerEvent('pointerup', touch))
}

export const resizeWindow = () => {
  window.dispatchEvent(new Event('resize'))
}

/** Stands in for the GSAP intro stroke: records each play, and lets the test drive its brush and see it stopped. */
const createFakeIntroStroke = () => {
  const plays: Array<{ brush: IntroStrokeBrush, stop: ReturnType<typeof vi.fn> }> = []
  const playIntroStroke = vi.fn((brush: IntroStrokeBrush) => {
    const stop = vi.fn()
    plays.push({ brush, stop })
    return stop
  })
  return { plays, playIntroStroke }
}

// Every controller is disposed after its test so its window listeners don't leak into the next one.
const liveControllers: Array<{ dispose: () => void }> = []

export const disposeLiveControllers = () => {
  liveControllers.splice(0).forEach(controller => controller.dispose())
}

export const setupController = ({ reduce = false, loadFails = false } = {}) => {
  const adapter = createFakeAdapter()
  const motion = createFakeMotionQuery(reduce)
  const states: SceneState[] = []
  const intro = createFakeIntroStroke()
  const loadScene = vi.fn(() => (loadFails ? Promise.reject(new Error('no WebGL2')) : Promise.resolve(adapter)))
  const controller = createSceneController({
    target: window,
    reducedMotionQuery: motion.query,
    pageVisibility: document,
    loadScene,
    playIntroStroke: intro.playIntroStroke,
    onStateChange: state => states.push(state),
  })
  liveControllers.push(controller)
  return { adapter, motion, states, intro, loadScene, controller }
}

