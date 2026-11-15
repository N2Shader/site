import { SceneSettings } from './SceneSettings'

export type SceneViewport = {
  width: number
  height: number
  pixelRatio: number
}

export type ViewportReading = {
  width: number
  height: number
  devicePixelRatio: number
}

/** Size of the scene canvas in CSS pixels, with the device pixel ratio capped so dense screens don't blow the fill budget. */
export const measureSceneViewport = ({ width, height, devicePixelRatio }: ViewportReading): SceneViewport => ({
  width,
  height,
  pixelRatio: Math.min(devicePixelRatio, SceneSettings.maxPixelRatio),
})
