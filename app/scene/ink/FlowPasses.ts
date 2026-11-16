import type { Node, TextureNode } from 'three/webgpu'
import { abs, length, mix, screenUV, smoothstep, vec2, vec4 } from 'three/tsl'
import { brushPushFalloff } from './BrushShape'
import { fragmentPixel } from './InkUniforms'
import type { InkUniforms } from './InkUniforms'

/**
 * The water flow, on the half-resolution flow grid (Stam's stable fluids): curl, then advect velocity, then
 * divergence, then pressure ×N (Jacobi), then project. Velocity is in CSS pixels per second.
 */

/** Samples `grid` one flow cell away from this fragment, `dx` cells right and `dy` cells down. */
const sampleFlowNeighbour = (uniforms: InkUniforms, grid: TextureNode, dx: number, dy: number) =>
  grid.sample(screenUV.add(vec2(dx, dy).mul(uniforms.flowCell).div(uniforms.viewportSize)))

/** Central difference of one channel across the flow cell, in units per CSS pixel. */
const flowGradient = (uniforms: InkUniforms, readChannel: (dx: number, dy: number) => Node<'float'>) => vec2(
  readChannel(1, 0).sub(readChannel(-1, 0)).div(uniforms.flowCell.x.mul(2)),
  readChannel(0, 1).sub(readChannel(0, -1)).div(uniforms.flowCell.y.mul(2)),
)

/** How fast the water swirls in each cell. */
export const createCurlNode = (uniforms: InkUniforms) => {
  const velocityAt = (dx: number, dy: number) => sampleFlowNeighbour(uniforms, uniforms.velocity, dx, dy)
  const swirlY = velocityAt(1, 0).y.sub(velocityAt(-1, 0).y).div(uniforms.flowCell.x.mul(2))
  const swirlX = velocityAt(0, 1).x.sub(velocityAt(0, -1).x).div(uniforms.flowCell.y.mul(2))
  return vec4(swirlY.sub(swirlX), 0, 0, 1)
}

/** Pushes velocity back towards the swirls the grid would otherwise smear out (vorticity confinement). */
const vorticityConfinement = (uniforms: InkUniforms) => {
  const swirlStrength = flowGradient(uniforms, (dx, dy) => abs(sampleFlowNeighbour(uniforms, uniforms.curl, dx, dy).x))
  const towardsSwirl = swirlStrength.div(length(swirlStrength).add(1e-5))
  const swirl = uniforms.curl.sample(screenUV).x
  const scale = uniforms.flowCell.x.mul(uniforms.settings.flow.vorticity)
  return vec2(towardsSwirl.y.mul(swirl), towardsSwirl.x.mul(swirl).negate()).mul(scale)
}

/**
 * Moves velocity along itself, adds the swirl and the brush's push, and loses some to friction. Water only moves where
 * the paper is wet.
 */
export const createAdvectVelocityNode = (uniforms: InkUniforms) => {
  const { velocityInjection } = uniforms.settings.brush
  const ownVelocity = uniforms.velocity.sample(screenUV).xy
  const tracedBack = screenUV.sub(ownVelocity.mul(uniforms.frameSeconds).div(uniforms.viewportSize))
  const carried = uniforms.velocity.sample(tracedBack).xy.add(vorticityConfinement(uniforms).mul(uniforms.frameSeconds))
  const brushPush = brushPushFalloff(uniforms, fragmentPixel(uniforms)).mul(velocityInjection)
  const pushed = mix(carried, uniforms.brushVelocity, brushPush)
  const wetness = smoothstep(0, uniforms.settings.flow.wetWater, uniforms.state.sample(screenUV).x)
  return vec4(pushed.mul(uniforms.frictionKeep).mul(wetness), 0, 1)
}

/** How much water leaves each cell. */
export const createDivergenceNode = (uniforms: InkUniforms) => {
  const velocityAt = (dx: number, dy: number) => sampleFlowNeighbour(uniforms, uniforms.velocity, dx, dy)
  const outflowX = velocityAt(1, 0).x.sub(velocityAt(-1, 0).x).div(uniforms.flowCell.x.mul(2))
  const outflowY = velocityAt(0, 1).y.sub(velocityAt(0, -1).y).div(uniforms.flowCell.y.mul(2))
  return vec4(outflowX.add(outflowY), 0, 0, 1)
}

/** One Jacobi step towards the pressure that cancels the divergence. */
export const createPressureNode = (uniforms: InkUniforms) => {
  const pressureAt = (dx: number, dy: number) => sampleFlowNeighbour(uniforms, uniforms.pressure, dx, dy).x
  const neighbours = pressureAt(1, 0).add(pressureAt(-1, 0)).add(pressureAt(0, 1)).add(pressureAt(0, -1))
  const cellArea = uniforms.flowCell.x.mul(uniforms.flowCell.y)
  const divergence = uniforms.divergence.sample(screenUV).x
  return vec4(neighbours.sub(divergence.mul(cellArea)).mul(0.25), 0, 0, 1)
}

/** Subtracts the pressure gradient, so the water neither piles up nor thins out. */
export const createProjectNode = (uniforms: InkUniforms) => {
  const pressureGradient = flowGradient(uniforms, (dx, dy) => sampleFlowNeighbour(uniforms, uniforms.pressure, dx, dy).x)
  return vec4(uniforms.velocity.sample(screenUV).xy.sub(pressureGradient), 0, 1)
}
