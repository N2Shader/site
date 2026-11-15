import type { Ref } from 'vue'
import { whenBrowserIdle } from '~/scene/BrowserIdle'
import { createSceneController } from '~/scene/SceneController'
import type { SceneState } from '~/scene/SceneController'
import type { SceneViewport } from '~/scene/SceneViewport'

/** `pending` until the scene has loaded; the fallback backdrop shows meanwhile. */
export type BackgroundSceneState = SceneState | 'pending'

const loadSceneInto = (canvas: HTMLCanvasElement) => async (viewport: SceneViewport) => {
  // Dynamic import keeps three.js out of the initial bundle.
  const { loadThreeScene } = await import('~/scene/ThreeSceneAdapter')
  return loadThreeScene(canvas, viewport)
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
      loadScene: loadSceneInto(canvas.value),
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
