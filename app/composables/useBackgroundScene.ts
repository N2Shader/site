import type { Ref } from 'vue'
import { whenBrowserIdle } from '~/scene/BrowserIdle'
import { createSceneController } from '~/scene/SceneController'
import type { IntroStrokePlayer, SceneState } from '~/scene/SceneController'
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

/** Mounts the background scene into `canvas` once the browser is idle after first paint, and tears it down on unmount. */
export const useBackgroundScene = (canvas: Ref<HTMLCanvasElement | null>) => {
  const sceneState = ref<BackgroundSceneState>('pending')
  let cancelIdle = () => {}
  let disposeScene = () => {}

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
    void controller.start()
  }

  onMounted(() => {
    cancelIdle = whenBrowserIdle(startScene)
  })

  onBeforeUnmount(() => {
    cancelIdle()
    disposeScene()
  })

  return sceneState
}
