import type { Ref } from 'vue'
import { whenBrowserIdle } from '~/scene/BrowserIdle'
import { createSceneController } from '~/scene/SceneController'
import type { IntroStrokePlayer, SceneTuning } from '~/scene/SceneAdapter'
import type { SceneState } from '~/scene/SceneController'
import type { SceneViewport } from '~/scene/SceneViewport'

/** `pending` until the scene has loaded; the fallback backdrop shows meanwhile. */
export type BackgroundSceneState = SceneState | 'pending'

/**
 * Loads the scene into `canvas` and the intro stroke with it. Dynamic imports keep three.js and GSAP out of the initial
 * bundle. The controller only plays the intro once the scene has loaded, so the player is always there by then.
 */
const createLazyScene = (canvas: HTMLCanvasElement) => {
  let loadedIntroPlayer: IntroStrokePlayer | null = null

  const loadScene = async (viewport: SceneViewport) => {
    const [{ loadThreeScene }, introStrokeModule] = await Promise.all([
      import('~/scene/ThreeSceneAdapter'),
      import('~/scene/IntroStrokePlayer'),
    ])
    loadedIntroPlayer = introStrokeModule.playIntroStroke
    return loadThreeScene(canvas, viewport)
  }

  const playIntroStroke: IntroStrokePlayer = (brush, viewport) => loadedIntroPlayer?.(brush, viewport) ?? (() => {})

  return { loadScene, playIntroStroke }
}

/**
 * The painting tuning panel is dev only (ticket 17). In production `import.meta.dev` is false, so this is null and the
 * panel and Tweakpane are never bundled.
 */
const loadPaintingTuningPanel = import.meta.dev ? () => import('~/scene/PaintingTuningPanel') : null

/**
 * In dev with `#debug` in the URL when the scene starts, shows the painting tuning panel while the moving scene runs,
 * and removes it otherwise (no panel on the still frame). Returns a function that stops following and removes it.
 */
const followSceneWithTuningPanel = (tuning: SceneTuning, sceneState: Ref<BackgroundSceneState>) => {
  if (!loadPaintingTuningPanel || window.location.hash !== '#debug') return () => {}
  const loadPanel = loadPaintingTuningPanel
  let removePanel: Promise<() => void> | null = null
  const hidePanel = () => {
    void removePanel?.then(remove => remove())
    removePanel = null
  }
  const stopWatching = watch(sceneState, (state) => {
    if (state !== 'running') hidePanel()
    else removePanel ??= loadPanel().then(({ mountPaintingTuningPanel }) => mountPaintingTuningPanel(tuning))
  })
  return () => {
    stopWatching()
    hidePanel()
  }
}

/** Mounts the background scene into `canvas` once the browser is idle after first paint, and tears it down on unmount. */
export const useBackgroundScene = (canvas: Ref<HTMLCanvasElement | null>) => {
  const sceneState = ref<BackgroundSceneState>('pending')
  let cancelIdle = () => {}
  let disposeScene = () => {}
  let stopTuningPanel = () => {}

  const startScene = () => {
    if (!canvas.value) return
    const controller = createSceneController({
      target: window,
      reducedMotionQuery: window.matchMedia('(prefers-reduced-motion: reduce)'),
      pageVisibility: document,
      ...createLazyScene(canvas.value),
      onStateChange: (state) => {
        sceneState.value = state
      },
    })
    disposeScene = controller.dispose
    stopTuningPanel = followSceneWithTuningPanel(controller.tuning, sceneState)
    void controller.start()
  }

  onMounted(() => {
    cancelIdle = whenBrowserIdle(startScene)
  })

  onBeforeUnmount(() => {
    cancelIdle()
    stopTuningPanel()
    disposeScene()
  })

  return sceneState
}
