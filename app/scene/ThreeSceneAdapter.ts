import { Color, OrthographicCamera, Scene, WebGPURenderer } from 'three/webgpu'
import type { SceneAdapter } from './SceneController'
import { SceneSettings } from './SceneSettings'
import type { SceneViewport } from './SceneViewport'

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

const createPaperScene = () => {
  const scene = new Scene()
  // Ticket 12 replaces the flat colour with textured paper and ink.
  scene.background = new Color(SceneSettings.paperColor)
  return scene
}

/** The real background scene: a three.js WebGPURenderer drawing into the given canvas. Loaded lazily (ADR-0008). */
export const loadThreeScene = async (canvas: HTMLCanvasElement, viewport: SceneViewport): Promise<SceneAdapter> => {
  const renderer = await createRenderer(canvas)
  const scene = createPaperScene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const renderFrame = () => renderer.render(scene, camera)

  const resize = ({ width, height, pixelRatio }: SceneViewport) => {
    renderer.setPixelRatio(pixelRatio)
    // `false` leaves the canvas CSS size to the stylesheet, so resizing never shifts layout.
    renderer.setSize(width, height, false)
  }

  const startLoop = () => {
    void renderer.setAnimationLoop(renderFrame)
  }

  const stopLoop = () => {
    void renderer.setAnimationLoop(null)
  }

  resize(viewport)

  return {
    resize,
    renderStillFrame: renderFrame,
    startLoop,
    stopLoop,
    // Ticket 12 lays ink here.
    moveBrush: () => {},
    dispose: () => {
      stopLoop()
      renderer.dispose()
    },
  }
}
