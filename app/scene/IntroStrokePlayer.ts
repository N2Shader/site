import { gsap } from 'gsap'
import { createIntroStrokePath, findPointAlongPath } from './IntroStrokePath'
import type { IntroStrokePlayer } from './SceneController'
import { SceneSettings } from './SceneSettings'

/**
 * Plays the intro stroke with GSAP: a virtual brush moves along this visit's random path through the same brush input
 * as the visitor's pointer, and lifts at the end. Loaded lazily with the scene, so GSAP stays out of the first bundle.
 */
export const playIntroStroke: IntroStrokePlayer = (brush, viewport) => {
  const { durationSeconds, points } = createIntroStrokePath(viewport)
  const brushHead = { progress: 0 }
  brush.moveBrush(findPointAlongPath(points, 0))
  const tween = gsap.to(brushHead, {
    progress: 1,
    duration: durationSeconds,
    ease: SceneSettings.introStroke.ease,
    onUpdate: () => brush.moveBrush(findPointAlongPath(points, brushHead.progress)),
    onComplete: brush.liftBrush,
  })
  return () => {
    tween.kill()
  }
}
