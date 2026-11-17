import type { QualityTier } from './QualityTier'
import { SceneSettings } from './SceneSettings'
import type { SceneViewport } from './SceneViewport'

export type GridSize = { width: number, height: number }

export type SimulationGrid = {
  /** Ink and water live here. */
  ink: GridSize
  /** The water flow runs here, at half the ink grid's resolution. */
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

/** Sizes of the simulation's grids for a viewport. The low quality tier gets a coarser ink grid. */
export const measureSimulationGrid = (
  viewport: SceneViewport,
  { inkCellsPerPixel, maxInkCells }: QualityTier,
): SimulationGrid => {
  const { width, height, pixelRatio } = viewport
  const { flowScale } = SceneSettings.grid
  const inkScale = Math.min(inkCellsPerPixel, maxInkCells / Math.max(width, height, 1))
  const ink = scaleGrid(width, height, inkScale)
  return {
    ink,
    flow: scaleGrid(ink.width, ink.height, flowScale),
    paper: scaleGrid(width, height, pixelRatio),
    brushRadius: measureBrushRadius(viewport),
  }
}
