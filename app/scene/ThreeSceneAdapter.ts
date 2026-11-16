import { WebGPURenderer } from 'three/webgpu'
import { createBrushStroke } from './BrushStroke'
import { createInkSimulation } from './ink/InkSimulation'
import type { SceneAdapter } from './SceneController'
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

/** The real background scene: the ink simulation drawn by a three.js WebGPURenderer. Loaded lazily (ADR-0008). */
export const loadThreeScene = async (canvas: HTMLCanvasElement, viewport: SceneViewport): Promise<SceneAdapter> => {
  const renderer = await createRenderer(canvas)
  sizeCanvas(renderer, viewport)
  const simulation = createInkSimulation(renderer, viewport, measureSimulationGrid(viewport))
  const brush = createBrushStroke(shortSideOf(viewport))
  let lastFrameMs: number | null = null

  const renderMovingFrame = (nowMs: number) => {
    const frameSeconds = measureFrameSeconds(lastFrameMs, nowMs)
    lastFrameMs = nowMs
    simulation.step(frameSeconds, brush.takeFrameDab(frameSeconds))
    simulation.draw()
  }

  const resize = (nextViewport: SceneViewport) => {
    sizeCanvas(renderer, nextViewport)
    simulation.startSheet(nextViewport, measureSimulationGrid(nextViewport))
    brush.resetForSheet(shortSideOf(nextViewport))
  }

  const startLoop = () => {
    lastFrameMs = null
    void renderer.setAnimationLoop(renderMovingFrame)
  }

  const stopLoop = () => {
    void renderer.setAnimationLoop(null)
  }

  return {
    resize,
    renderStillFrame: () => {
      simulation.clearInk()
      simulation.draw()
    },
    startLoop,
    stopLoop,
    moveBrush: brush.moveTo,
    liftBrush: brush.lift,
    dispose: () => {
      stopLoop()
      simulation.dispose()
      renderer.dispose()
    },
  }
}
