import type { BrushPoint } from './BrushPointer'
import type { QualityTierChoice } from './QualityTier'
import type { SceneViewport } from './SceneViewport'

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
  /** Dev tuning panel (ticket 17): picks up retuned `SceneSettings`, keeping the ink. */
  applyTunedSettings: () => void
  /** Dev tuning panel: wipes all water and ink, leaving clean paper. */
  clearInk: () => void
  /** Dev tuning panel: rebuilds the grids at a forced quality tier, on clean paper. */
  useQualityTier: (choice: QualityTierChoice) => void
  dispose: () => void
}

/** What the dev tuning panel (ticket 17) can do to the running scene. Each wakes the loop to show the change. */
export type SceneTuning = {
  applyTunedSettings: () => void
  clearInk: () => void
  useQualityTier: (choice: QualityTierChoice) => void
  replayIntroStroke: () => void
  /** Ends the visitor's stroke when the pointer enters the panel, so it doesn't join across it. */
  liftBrush: () => void
}

/** The part of the scene the intro stroke paints with: the same brush input as the visitor's pointer. */
export type IntroStrokeBrush = Pick<SceneAdapter, 'moveBrush' | 'liftBrush'>

/** Starts the intro stroke on `brush` and returns a function that stops it early. */
export type IntroStrokePlayer = (brush: IntroStrokeBrush, viewport: SceneViewport) => () => void
