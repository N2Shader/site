import { listenForBrushPointer } from './BrushPointer'
import { SceneSettings } from './SceneSettings'
import type { BrushPoint } from './BrushPointer'
import { measureSceneViewport } from './SceneViewport'
import type { SceneViewport } from './SceneViewport'

export type SceneState = 'running' | 'still' | 'failed'

/** The rendering side of the background scene. The real one wraps three.js; tests use a fake. */
export type SceneAdapter = {
  /** Rebuilds the grid for the new size and clears the paper of ink. */
  resize: (viewport: SceneViewport) => void
  /** Clears to clean paper and draws one frame (the still frame). */
  renderStillFrame: () => void
  startLoop: () => void
  stopLoop: () => void
  moveBrush: (point: BrushPoint) => void
  dispose: () => void
}

export type MotionQuery = Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>

export type SceneControllerOptions = {
  target: Window
  reducedMotionQuery: MotionQuery
  loadScene: (viewport: SceneViewport) => Promise<SceneAdapter>
  onStateChange: (state: SceneState) => void
}

const readViewport = (target: Window) => measureSceneViewport({
  width: target.innerWidth,
  height: target.innerHeight,
  devicePixelRatio: target.devicePixelRatio,
})

/**
 * Runs the background scene: loads it, picks the moving scene or the still frame from the
 * visitor's motion setting, and follows that setting while the page is open.
 */
export const createSceneController = ({ target, reducedMotionQuery, loadScene, onStateChange }: SceneControllerOptions) => {
  let adapter: SceneAdapter | null = null
  let stopBrushPointer: (() => void) | null = null
  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  const runMovingScene = (scene: SceneAdapter) => {
    stopBrushPointer = listenForBrushPointer(target, scene.moveBrush)
    scene.startLoop()
    onStateChange('running')
  }

  /** The moving scene is running exactly while the brush pointer is being followed. */
  const isRunning = () => stopBrushPointer !== null

  const stopRunning = (scene: SceneAdapter) => {
    if (!stopBrushPointer) return
    stopBrushPointer()
    stopBrushPointer = null
    scene.stopLoop()
  }

  const showStillFrame = (scene: SceneAdapter) => {
    stopRunning(scene)
    scene.renderStillFrame()
    onStateChange('still')
  }

  const applyMotionPreference = () => {
    if (!adapter) return
    if (reducedMotionQuery.matches) showStillFrame(adapter)
    else if (!isRunning()) runMovingScene(adapter)
  }

  const rebuildAtViewportSize = () => {
    if (!adapter) return
    adapter.resize(readViewport(target))
    // A running loop redraws by itself; the still frame has to be drawn again.
    if (!isRunning()) adapter.renderStillFrame()
  }

  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(rebuildAtViewportSize, SceneSettings.resizeDebounceMs)
  }

  const start = async () => {
    let loadedScene: SceneAdapter
    try {
      loadedScene = await loadScene(readViewport(target))
    }
    catch {
      if (!disposed) onStateChange('failed')
      return
    }
    if (disposed) {
      loadedScene.dispose()
      return
    }
    adapter = loadedScene
    reducedMotionQuery.addEventListener('change', applyMotionPreference)
    target.addEventListener('resize', onResize)
    applyMotionPreference()
  }

  const dispose = () => {
    disposed = true
    reducedMotionQuery.removeEventListener('change', applyMotionPreference)
    target.removeEventListener('resize', onResize)
    clearTimeout(resizeTimer)
    if (!adapter) return
    stopRunning(adapter)
    adapter.dispose()
    adapter = null
  }

  return { start, dispose }
}
