import { WebGPURenderer } from 'three/webgpu'
import { createBrushStroke } from './BrushStroke'
import { createCleanPaperClock } from './CleanPaperClock'
import { createInkSimulation } from './ink/InkSimulation'
import { readQualityTier, readQualityTierForChoice } from './QualityTier'
import type { QualityTierChoice } from './QualityTier'
import type { SceneAdapter } from './SceneAdapter'
import { SceneSettings } from './SceneSettings'
import type { SceneViewport } from './SceneViewport'
import { measureSimulationGrid } from './SimulationGrid'

const createRenderer = async (canvas: HTMLCanvasElement) => {
  // Uses WebGPU, and falls back to WebGL2 by itself. `init` rejects when neither starts.
  const renderer = new WebGPURenderer({ canvas, antialias: false, alpha: false })
  try {
    await renderer.init()
  }
  catch (error) {
    renderer.dispose()
    throw error
  }
  return renderer
}

/** The renderer's internal frame clock. Not in its public types (three r187). */
type RendererWithFrameClock = { _animation?: { stop?: () => void } }

/**
 * Stops the renderer's own requestAnimationFrame. Every render restarts it, and `setAnimationLoop(null)` only drops our
 * callback, so without this a sleeping scene (or the still frame) would still wake the page every frame.
 */
const stopRendererFrameClock = (renderer: WebGPURenderer) => {
  (renderer as unknown as RendererWithFrameClock)._animation?.stop?.()
}

const shortSideOf = ({ width, height }: SceneViewport) => Math.min(width, height)

/** Seconds since the last frame, kept in a range so a dropped frame never makes the simulation jump. */
const measureFrameSeconds = (lastFrameMs: number | null, nowMs: number) => {
  const { minFrameSeconds, maxFrameSeconds } = SceneSettings
  if (lastFrameMs === null) return 1 / 60
  return Math.min(maxFrameSeconds, Math.max(minFrameSeconds, (nowMs - lastFrameMs) / 1000))
}

const sizeCanvas = (renderer: WebGPURenderer, { width, height, pixelRatio }: SceneViewport) => {
  renderer.setPixelRatio(pixelRatio)
  // `false` leaves the canvas CSS size to the stylesheet, so resizing never shifts layout.
  renderer.setSize(width, height, false)
}

/**
 * The real background scene: the ink simulation drawn by a three.js WebGPURenderer. Loaded lazily, at the quality tier
 * the device gets (ADR-0008).
 */
export const loadThreeScene = async (canvas: HTMLCanvasElement, viewport: SceneViewport): Promise<SceneAdapter> => {
  const renderer = await createRenderer(canvas)
  sizeCanvas(renderer, viewport)
  let qualityTier = readQualityTier(window)
  let paperViewport = viewport
  const simulation = createInkSimulation(renderer, viewport, measureSimulationGrid(viewport, qualityTier), qualityTier)
  const brush = createBrushStroke(shortSideOf(viewport))
  const paperClock = createCleanPaperClock()
  let lastFrameMs: number | null = null

  /** Steps and draws one frame, and says whether the paper is clean with the brush laying nothing. */
  const renderMovingFrame = (nowMs: number) => {
    const frameSeconds = measureFrameSeconds(lastFrameMs, nowMs)
    lastFrameMs = nowMs
    const dab = brush.takeFrameDab(frameSeconds)
    paperClock.advanceFrame(frameSeconds, dab !== null)
    simulation.step(frameSeconds, dab)
    simulation.draw()
    return paperClock.isPaperClean()
  }

  const resize = (nextViewport: SceneViewport) => {
    paperViewport = nextViewport
    sizeCanvas(renderer, nextViewport)
    simulation.startFreshPaper(nextViewport, measureSimulationGrid(nextViewport, qualityTier), qualityTier)
    brush.resetForFreshPaper(shortSideOf(nextViewport))
    paperClock.markPaperClean()
  }

  const clearInk = () => {
    simulation.clearInk()
    brush.lift()
    paperClock.markPaperClean()
  }

  const useQualityTier = (choice: QualityTierChoice) => {
    qualityTier = readQualityTierForChoice(window, choice)
    resize(paperViewport)
  }

  const startLoop = (onPaperClean: () => void) => {
    lastFrameMs = null
    void renderer.setAnimationLoop((nowMs) => {
      if (renderMovingFrame(nowMs)) onPaperClean()
    })
  }

  const stopLoop = () => {
    void renderer.setAnimationLoop(null)
    stopRendererFrameClock(renderer)
  }

  return {
    resize,
    renderStillFrame: () => {
      simulation.clearInk()
      paperClock.markPaperClean()
      simulation.draw()
      stopRendererFrameClock(renderer)
    },
    startLoop,
    stopLoop,
    applyTunedSettings: simulation.applyTunedSettings,
    clearInk,
    useQualityTier,
    moveBrush: brush.moveTo,
    liftBrush: brush.lift,
    dispose: () => {
      stopLoop()
      simulation.dispose()
      renderer.dispose()
    },
  }
}
