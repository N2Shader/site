// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { measureSceneViewport } from '../../app/scene/SceneViewport'

describe('measureSceneViewport', () => {
  it('caps the device pixel ratio at 2 on dense screens', () => {
    expect(measureSceneViewport({ width: 390, height: 844, devicePixelRatio: 3 })).toEqual({
      width: 390,
      height: 844,
      pixelRatio: 2,
    })
  })
})
