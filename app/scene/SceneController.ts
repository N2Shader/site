import { listenForBrushPointer } from './BrushPointer'
import type { BrushPoint } from './BrushPointer'
import type { IntroStrokePlayer, SceneAdapter, SceneTuning } from './SceneAdapter'
import { SceneSettings } from './SceneSettings'
import { measureSceneViewport } from './SceneViewport'
import type { SceneViewport } from './SceneViewport'

export type SceneState = 'running' | 'still' | 'failed'

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

  const playIntro = (scene: SceneAdapter) => {
    stopIntro = playIntroStroke({ moveBrush: moveBrushWakingLoop(scene), liftBrush: scene.liftBrush }, readViewport(target))
  }

  /** The intro stroke plays once per visit, the first time the moving scene runs. */
  const playIntroOnce = (scene: SceneAdapter) => {
    if (hasPlayedIntro) return
    hasPlayedIntro = true
    playIntro(scene)
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

  /** The loop draws the changed paper (waking for a frame if it slept); the still frame is drawn again. */
  const redrawScene = (scene: SceneAdapter) => {
    if (isRunning()) wakeLoop(scene)
    else scene.renderStillFrame()
  }

  const rebuildAtViewportSize = () => {
    if (!adapter) return
    // The resize clears the paper, and the intro's path was laid out for the old size.
    stopIntroEarly(adapter)
    adapter.resize(readViewport(target))
    redrawScene(adapter)
  }

  /** Runs a tuning change on the loaded scene, then redraws. A change that wipes the ink stops the intro stroke first. */
  const tuneScene = (tuneAdapter: (scene: SceneAdapter) => void, { wipesInk }: { wipesInk: boolean }) => {
    if (!adapter) return
    if (wipesInk) stopIntroEarly(adapter)
    tuneAdapter(adapter)
    redrawScene(adapter)
  }

  const tuning: SceneTuning = {
    applyTunedSettings: () => tuneScene(scene => scene.applyTunedSettings(), { wipesInk: false }),
    clearInk: () => tuneScene(scene => scene.clearInk(), { wipesInk: true }),
    useQualityTier: choice => tuneScene(scene => scene.useQualityTier(choice), { wipesInk: true }),
    replayIntroStroke: () => {
      if (!adapter || !isRunning()) return
      stopIntroEarly(adapter)
      playIntro(adapter)
    },
    liftBrush: () => {
      if (adapter && isRunning()) liftVisitorBrush(adapter)()
    },
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

  return { start, dispose, tuning }
}
