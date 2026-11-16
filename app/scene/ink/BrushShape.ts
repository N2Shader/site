import type { Node } from 'three/webgpu'
import { clamp, dot, exp, length, max, smoothstep, vec2 } from 'three/tsl'
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

/** This frame's line radius in CSS pixels: the pen size, thinned by speed. */
const measureLineRadius = (uniforms: InkUniforms) => uniforms.brushRadius.mul(uniforms.brushWidth)

/** Soft round reach of the brush, for pushing the water along its path. */
export const brushPushFalloff = (uniforms: InkUniforms, pixel: Vec2Node) => {
  const { distance } = measureBrushLine(uniforms, pixel)
  const reach = distance.div(measureLineRadius(uniforms))
  return exp(reach.mul(reach).mul(-2)).mul(uniforms.brushActive)
}

/**
 * Share of this cell the brush covers this frame: a solid core, a soft edge that fades to grey, ragged edges,
 * bristles that splay sideways, and dry-brush gaps that open up between the bristles as the load runs low. The noise
 * is scaled by the full pen size, so the bristle texture stays the same as the line thins.
 */
export const brushCoverage = (uniforms: InkUniforms, pixel: Vec2Node) => {
  const { raggedness, splay, dryLoad, softEdgeShare } = uniforms.settings.brush
  const radius = uniforms.brushRadius
  const { distance, along, across } = measureBrushLine(uniforms, pixel)
  const raggedEdge = valueNoise(pixel.div(radius.mul(0.3)))
  const splayedBristles = valueNoise(vec2(across.div(radius.mul(0.12)), along.div(radius.mul(2.5))))
  const edgeRadius = measureLineRadius(uniforms)
    .mul(raggedEdge.sub(0.5).mul(raggedness).add(1))
    .mul(splayedBristles.sub(0.5).mul(splay).add(1))
  const coreRadius = edgeRadius.mul(max(softEdgeShare.oneMinus(), 0))
  const body = smoothstep(coreRadius, edgeRadius, distance).oneMinus()
  const dryness = clamp(uniforms.brushLoad.oneMinus().sub(dryLoad.oneMinus()).div(dryLoad), 0, 1).mul(0.9)
  const bristle = valueNoise(vec2(across.div(radius.mul(0.07)), along.div(radius.mul(4))))
  const gaps = smoothstep(dryness.sub(0.08), dryness.add(0.08), bristle)
  return body.mul(gaps).mul(uniforms.brushActive)
}
