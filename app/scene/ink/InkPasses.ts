import type { Node } from 'three/webgpu'
import { clamp, float, max, min, mix, screenUV, smoothstep, step, vec2, vec4 } from 'three/tsl'
import { SceneSettings } from '../SceneSettings'
import { brushCoverage } from './BrushShape'
import { fragmentPixel } from './InkUniforms'
import type { InkUniforms } from './InkUniforms'

type FloatNode = Node<'float'>

/** The four neighbouring cells: right, left, down, up. */
const neighbourOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

/** UV of the paint cell `dx` cells right and `dy` cells down, times `reach`. */
const paintNeighbourUv = (uniforms: InkUniforms, dx: number, dy: number, reach = 1) =>
  screenUV.add(vec2(dx * reach, dy * reach).mul(uniforms.paintCell).div(uniforms.viewportSize))

/** Ink per unit of water, kept finite where there's almost no water. */
const inkConcentration = (water: FloatNode, ink: FloatNode) => clamp(ink.div(max(water, 1e-3)), 0, 4)

/** Carry: floating ink and water move along the flow, then the brush adds its own. Deposited ink stays put. */
export const createCarryNode = (uniforms: InkUniforms) => {
  const { water: brushWater, ink: brushInk } = SceneSettings.brush
  const flow = uniforms.velocity.sample(screenUV).xy
  const carried = uniforms.state.sample(screenUV.sub(flow.mul(uniforms.frameSeconds).div(uniforms.viewportSize)))
  const here = uniforms.state.sample(screenUV)
  const laid = brushCoverage(uniforms, fragmentPixel(uniforms)).mul(uniforms.brushStrength)
  return vec4(
    min(carried.x.add(laid.mul(brushWater)), 1),
    min(carried.y.add(laid.mul(brushInk)), 1),
    here.z,
    here.w,
  )
}

/** Water that soaks between this cell and one neighbour this step, plus the ink it takes along. Positive flows in. */
const soakFromNeighbour = (uniforms: InkUniforms, here: Node<'vec4'>, permeability: FloatNode, dx: number, dy: number) => {
  const { spreadRate, dryWater, pinWater } = SceneSettings.ink
  const neighbourUv = paintNeighbourUv(uniforms, dx, dy)
  const neighbour = uniforms.state.sample(neighbourUv)
  const rate = permeability.add(uniforms.paper.sample(neighbourUv).y).mul(0.5 * spreadRate)
  // Pinning: a wet edge only creeps into dry paper when there's plenty of water behind it.
  const edgeCreep = smoothstep(pinWater, pinWater * 2, max(here.x, neighbour.x))
  const pinned = mix(edgeCreep, float(1), step(dryWater, min(here.x, neighbour.x)))
  const water = neighbour.x.sub(here.x).mul(rate).mul(pinned)
  const flowsIn = step(0, water)
  const concentration = mix(inkConcentration(here.x, here.y), inkConcentration(neighbour.x, neighbour.y), flowsIn)
  return { water, ink: water.mul(concentration) }
}

/** Spread: water and ink soak sideways into neighbouring cells, more where the paper is permeable. */
export const createSpreadNode = (uniforms: InkUniforms) => {
  const here = uniforms.state.sample(screenUV)
  const permeability = uniforms.paper.sample(screenUV).y
  let water: FloatNode = here.x
  let ink: FloatNode = here.y
  for (const [dx, dy] of neighbourOffsets) {
    const soaked = soakFromNeighbour(uniforms, here, permeability, dx, dy)
    water = water.add(soaked.water)
    ink = ink.add(soaked.ink)
  }
  return vec4(max(water, 0), max(ink, 0), here.z, here.w)
}

/** 1 at the rim of a wet patch, where water thins towards dry paper, and 0 inside it. */
const wetEdge = (uniforms: InkUniforms, water: FloatNode) => {
  let around: FloatNode = float(0)
  for (const [dx, dy] of neighbourOffsets) around = around.add(uniforms.state.sample(paintNeighbourUv(uniforms, dx, dy, 2)).x)
  const rim = clamp(water.sub(around.mul(0.25)).div(max(water, 0.01)), 0, 1)
  return rim.mul(step(SceneSettings.ink.dryWater, water))
}

/** Share of the floating ink that settles into the paper this frame. Low spots and wet edges take more. */
const settlingShare = (uniforms: InkUniforms, water: FloatNode, height: FloatNode) => {
  const { depositPerSecond, granulation, edgeDarkening, dryWater } = SceneSettings.ink
  const lowSpot = max(height.oneMinus().sub(0.5).mul(granulation * 2).add(1), 0.1)
  const rate = lowSpot.mul(wetEdge(uniforms, water).mul(edgeDarkening).add(1)).mul(depositPerSecond)
  // Once the water is nearly gone, all the floating ink dries into the paper.
  const drying = smoothstep(dryWater, dryWater * 6, water).oneMinus()
  return clamp(rate.mul(uniforms.frameSeconds).add(drying), 0, 1)
}

/** Dried ink that fades this frame: none while it holds, then back to clean paper by about 30 s. */
const fadeAmount = (uniforms: InkUniforms, age: FloatNode) => {
  const { holdSeconds, fadeSeconds, maxDeposit } = SceneSettings.ink
  return step(holdSeconds, age).mul(uniforms.frameSeconds).mul(maxDeposit / fadeSeconds)
}

/** Settle and fade: water evaporates, ink deposits into the paper and dries, and dried ink fades away. */
export const createSettleNode = (uniforms: InkUniforms) => {
  const { evaporationPerSecond, evaporationShare, maxDeposit, holdSeconds, fadeSeconds } = SceneSettings.ink
  const here = uniforms.state.sample(screenUV)
  const height = uniforms.paper.sample(screenUV).x
  const evaporation = here.x.mul(evaporationShare).add(evaporationPerSecond).mul(uniforms.frameSeconds)
  const water = max(here.x.sub(evaporation), 0)
  const settled = here.y.mul(settlingShare(uniforms, water, height))
  // Age restarts whenever ink settles here; capped so it never overflows the half float.
  const age = min(mix(here.w.add(uniforms.frameSeconds), float(0), step(1e-4, settled)), holdSeconds + fadeSeconds + 1)
  const deposited = max(min(here.z.add(settled), maxDeposit).sub(fadeAmount(uniforms, age)), 0)
  return vec4(water, here.y.sub(settled), deposited, age)
}
