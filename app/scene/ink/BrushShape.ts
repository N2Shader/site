import type { Node } from 'three/webgpu'
import { clamp, dot, exp, length, max, smoothstep, step, vec2 } from 'three/tsl'
import { SceneSettings } from '../SceneSettings'
import { valueNoise } from './ShaderNoise'
import type { InkUniforms } from './InkUniforms'

type Vec2Node = Node<'vec2'>

/** Where `pixel` sits relative to this frame's brush line: distance to it, and coordinates along and across it. */
const measureBrushLine = (uniforms: InkUniforms, pixel: Vec2Node) => {
  const line = uniforms.brushTo.sub(uniforms.brushFrom)
  const fromStart = pixel.sub(uniforms.brushFrom)
  const nearest = clamp(dot(fromStart, line).div(max(dot(line, line), 1e-4)), 0, 1)
  const direction = line.div(max(length(line), 1e-3))
  return {
    distance: length(fromStart.sub(line.mul(nearest))),
    along: dot(pixel, direction),
    across: dot(fromStart, vec2(direction.y.negate(), direction.x)),
  }
}

/** 1 while the brush is laying ink this frame, 0 at rest. */
const brushIsActive = (uniforms: InkUniforms) => step(1e-4, uniforms.brushStrength)

/** Soft round reach of the brush, for pushing the water along its path. */
export const brushPushFalloff = (uniforms: InkUniforms, pixel: Vec2Node) => {
  const { distance } = measureBrushLine(uniforms, pixel)
  const reach = distance.div(uniforms.brushRadius)
  return exp(reach.mul(reach).mul(-2)).mul(brushIsActive(uniforms))
}

/**
 * Share of this cell the brush covers this frame: ragged edges, bristles that splay sideways, and dry-brush gaps
 * that open up between the bristles as the load runs low.
 */
export const brushCoverage = (uniforms: InkUniforms, pixel: Vec2Node) => {
  const { raggedness, splay, dryLoad } = SceneSettings.brush
  const radius = uniforms.brushRadius
  const { distance, along, across } = measureBrushLine(uniforms, pixel)
  const raggedEdge = valueNoise(pixel.div(radius.mul(0.3)))
  const splayedBristles = valueNoise(vec2(across.div(radius.mul(0.12)), along.div(radius.mul(2.5))))
  const edgeRadius = radius
    .mul(raggedEdge.sub(0.5).mul(raggedness).add(1))
    .mul(splayedBristles.sub(0.5).mul(splay).add(1))
  const body = smoothstep(edgeRadius.mul(0.6), edgeRadius, distance).oneMinus()
  const dryness = clamp(uniforms.brushLoad.oneMinus().sub(1 - dryLoad).div(dryLoad), 0, 1).mul(0.9)
  const bristle = valueNoise(vec2(across.div(radius.mul(0.07)), along.div(radius.mul(4))))
  const gaps = smoothstep(dryness.sub(0.08), dryness.add(0.08), bristle)
  return body.mul(gaps).mul(brushIsActive(uniforms))
}
