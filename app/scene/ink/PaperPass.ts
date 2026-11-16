import type { Node } from 'three/webgpu'
import { abs, cos, pow, sin, vec2, vec4 } from 'three/tsl'
import { fractalNoise, valueNoise } from './ShaderNoise'
import { fragmentPixel } from './InkUniforms'
import type { InkUniforms } from './InkUniforms'

type Vec2Node = Node<'vec2'>

/** Long thin fibres lying at `angle`: ridges of noise stretched along that direction. */
const fibresAt = (pixel: Vec2Node, angle: number) => {
  const along = pixel.x.mul(cos(angle)).add(pixel.y.mul(sin(angle)))
  const across = pixel.y.mul(cos(angle)).sub(pixel.x.mul(sin(angle)))
  const ridge = abs(valueNoise(vec2(along.div(60), across.div(1.6))).mul(2).sub(1)).oneMinus()
  return pow(ridge, 10)
}

/**
 * The paper, made once per sheet: R height (tooth, grain and fibres), G permeability (how easily water soaks through),
 * B mottle (large soft blotches in the sheet).
 */
export const createPaperNode = (uniforms: InkUniforms) => {
  const pixel = fragmentPixel(uniforms)
  const tooth = fractalNoise(pixel.div(5), 3)
  const grain = valueNoise(pixel.div(1.1))
  const fibres = fibresAt(pixel, 0.4).add(fibresAt(pixel.add(vec2(311, 97)), 2.1)).mul(0.5)
  const height = tooth.mul(0.55).add(grain.mul(0.2)).add(fibres.mul(0.25))
  const permeability = fractalNoise(pixel.div(45), 3).mul(0.5).add(0.5).sub(fibres.mul(0.2))
  const mottle = fractalNoise(pixel.div(160), 4)
  return vec4(height, permeability, mottle, 1)
}
