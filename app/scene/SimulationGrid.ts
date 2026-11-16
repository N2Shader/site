import type { QualityTier } from './QualityTier'
import { SceneSettings } from './SceneSettings'
import type { SceneViewport } from './SceneViewport'

export type GridSize = { width: number, height: number }

export type SimulationGrid = {
  /** Ink and water live here. */
  paint: GridSize
  /** The water flow runs here, at half the paint grid's resolution. */
  flow: GridSize
  /** Paper texture at the canvas's real pixel size, so its grain stays sharp. */
  paper: GridSize
  /** Brush radius in CSS pixels. */
  brushRadius: number
}

const scaleGrid = (width: number, height: number, scale: number): GridSize => ({
  width: Math.max(1, Math.round(width * scale)),
  height: Math.max(1, Math.round(height * scale)),
})

/** Brush radius in CSS pixels for a viewport, from the live `SceneSettings.brush.radiusOfShortSide`. */
export const measureBrushRadius = ({ width, height }: Pick<SceneViewport, 'width' | 'height'>) =>
  Math.min(width, height) * SceneSettings.brush.radiusOfShortSide

/** Sizes of the simulation's grids for a viewport. The low quality tier gets a coarser paint grid. */
export const measureSimulationGrid = (
  viewport: SceneViewport,
  { paintCellsPerPixel, maxPaintCells }: QualityTier,
): SimulationGrid => {
  const { width, height, pixelRatio } = viewport
  const { flowScale } = SceneSettings.grid
  const paintScale = Math.min(paintCellsPerPixel, maxPaintCells / Math.max(width, height, 1))
  const paint = scaleGrid(width, height, paintScale)
  return {
    paint,
    flow: scaleGrid(paint.width, paint.height, flowScale),
    paper: scaleGrid(width, height, pixelRatio),
    brushRadius: measureBrushRadius(viewport),
  }
}
