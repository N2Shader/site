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
  /** Runs the frame loop. `onPaperClean` fires on each frame that finds the paper clean with the brush laying nothing. */
  startLoop: (onPaperClean: () => void) => void
  stopLoop: () => void
  moveBrush: (point: BrushPoint) => void
  /** Ends the current stroke, so the next move starts a new one. */
  liftBrush: () => void
  dispose: () => void
}

/** The part of the scene the intro stroke paints with: the same brush input as the visitor's pointer. */
export type IntroStrokeBrush = Pick<SceneAdapter, 'moveBrush' | 'liftBrush'>

/** Starts the intro stroke on `brush` and returns a function that stops it early. */
export type IntroStrokePlayer = (brush: IntroStrokeBrush, viewport: SceneViewport) => () => void

export type MotionQuery = Pick<MediaQueryList, 'matches' | 'addEventListener' | 'removeEventListener'>

/** Whether the tab is hidden, and its `visibilitychange` event. The real one is `document`. */
export type PageVisibility = Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>

export type SceneControllerOptions = {
  target: Window
  reducedMotionQuery: MotionQuery
  pageVisibility: PageVisibility
  loadScene: (viewport: SceneViewport) => Promise<SceneAdapter>
  playIntroStroke: IntroStrokePlayer
  onStateChange: (state: SceneState) => void
}

const readViewport = (target: Window) => measureSceneViewport({
  width: target.innerWidth,
  height: target.innerHeight,
  devicePixelRatio: target.devicePixelRatio,
})

/**
 * Runs the background scene: loads it, picks the moving scene or the still frame from the
 * visitor's motion setting, and follows that setting while the page is open. While the moving scene runs, its frame
 * loop sleeps when the paper is clean and the brush is idle, and while the tab is hidden.
 */
export const createSceneController = ({
  target,
  reducedMotionQuery,
  pageVisibility,
  loadScene,
  playIntroStroke,
  onStateChange,
}: SceneControllerOptions) => {
  let adapter: SceneAdapter | null = null
  let stopBrushPointer: (() => void) | null = null
  let stopIntro: (() => void) | null = null
  let hasPlayedIntro = false
  let isLoopAwake = false
  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  let disposed = false

  const sleepLoop = (scene: SceneAdapter) => {
    if (!isLoopAwake) return
    isLoopAwake = false
    scene.stopLoop()
  }

  /** Starts the frame loop unless it's already running or the tab is hidden. */
  const wakeLoop = (scene: SceneAdapter) => {
    if (isLoopAwake || pageVisibility.hidden) return
    isLoopAwake = true
    scene.startLoop(() => sleepLoop(scene))
  }

  /** Any brush move, the visitor's or the intro stroke's, wakes the loop so the ink gets painted. */
  const moveBrushWakingLoop = (scene: SceneAdapter) => (point: BrushPoint) => {
    wakeLoop(scene)
    scene.moveBrush(point)
  }

  /** The intro stroke plays once per visit, the first time the moving scene runs. */
  const playIntroOnce = (scene: SceneAdapter) => {
    if (hasPlayedIntro) return
    hasPlayedIntro = true
    stopIntro = playIntroStroke({ moveBrush: moveBrushWakingLoop(scene), liftBrush: scene.liftBrush }, readViewport(target))
  }

  /** Stops the intro stroke and lifts the brush, so whatever paints next starts a new line. */
  const stopIntroEarly = (scene: SceneAdapter) => {
    if (!stopIntro) return
    stopIntro()
    stopIntro = null
    scene.liftBrush()
  }

  /** The visitor's pointer takes the brush over from the intro stroke straight away, on a move or a tap. */
  const moveVisitorBrush = (scene: SceneAdapter) => {
    const moveBrush = moveBrushWakingLoop(scene)
    return (point: BrushPoint) => {
      stopIntroEarly(scene)
      moveBrush(point)
    }
  }

  const liftVisitorBrush = (scene: SceneAdapter) => () => {
    stopIntroEarly(scene)
    scene.liftBrush()
  }

  const runMovingScene = (scene: SceneAdapter) => {
    stopBrushPointer = listenForBrushPointer(target, moveVisitorBrush(scene), liftVisitorBrush(scene))
    wakeLoop(scene)
    playIntroOnce(scene)
    onStateChange('running')
  }

  /** The moving scene is running exactly while the brush pointer is being followed. */
  const isRunning = () => stopBrushPointer !== null

  const stopRunning = (scene: SceneAdapter) => {
    if (!stopBrushPointer) return
    stopIntroEarly(scene)
    stopBrushPointer()
    stopBrushPointer = null
    sleepLoop(scene)
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
    // The resize clears the paper, and the intro's path was laid out for the old size.
    stopIntroEarly(adapter)
    adapter.resize(readViewport(target))
    // Resizing clears the canvas. The loop draws the new paper (waking for a frame if it slept); the still frame is drawn again.
    if (isRunning()) wakeLoop(adapter)
    else adapter.renderStillFrame()
  }

  /** The loop sleeps while the tab is hidden, and wakes when it shows again; it goes back to sleep if the paper is clean. */
  const followPageVisibility = () => {
    if (!adapter || !isRunning()) return
    if (pageVisibility.hidden) sleepLoop(adapter)
    else wakeLoop(adapter)
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
    pageVisibility.addEventListener('visibilitychange', followPageVisibility)
    applyMotionPreference()
  }

  const dispose = () => {
    disposed = true
    reducedMotionQuery.removeEventListener('change', applyMotionPreference)
    target.removeEventListener('resize', onResize)
    pageVisibility.removeEventListener('visibilitychange', followPageVisibility)
    clearTimeout(resizeTimer)
    if (!adapter) return
    stopRunning(adapter)
    adapter.dispose()
    adapter = null
  }

  return { start, dispose }
}
