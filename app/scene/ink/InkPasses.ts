import type { Node } from 'three/webgpu'
import { clamp, float, max, min, mix, screenUV, select, smoothstep, step, vec2, vec4 } from 'three/tsl'
import { brushCoverage } from './BrushShape'
import { fragmentPixel } from './InkUniforms'
import type { InkUniforms } from './InkUniforms'

type FloatNode = Node<'float'>

/** The four neighbouring cells: right, left, down, up. */
const neighbourOffsets = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const

/** UV of the ink cell `dx` cells right and `dy` cells down, times `reach`. */
const inkNeighbourUv = (uniforms: InkUniforms, dx: number, dy: number, reach = 1) =>
  screenUV.add(vec2(dx * reach, dy * reach).mul(uniforms.inkCell).div(uniforms.viewportSize))

/** Ink per unit of water, kept finite where there's almost no water. */
const inkConcentration = (water: FloatNode, ink: FloatNode) => clamp(ink.div(max(water, 1e-3)), 0, 4)

/**
 * Carry: floating ink and water move along the flow, then the brush adds water and fills its cells up to its ink
 * level. Filling (not adding) keeps a fast stroke as black as a slow one. Deposited ink stays put.
 */
export const createCarryNode = (uniforms: InkUniforms) => {
  const { water: brushWater, ink: brushInk } = uniforms.settings.brush
  const flow = uniforms.velocity.sample(screenUV).xy
  const carried = uniforms.state.sample(screenUV.sub(flow.mul(uniforms.frameSeconds).div(uniforms.viewportSize)))
  const here = uniforms.state.sample(screenUV)
  const laid = brushCoverage(uniforms, fragmentPixel(uniforms))
  return vec4(
    min(carried.x.add(laid.mul(brushWater)), 1),
    min(max(carried.y, laid.mul(brushInk)), 1),
    here.z,
    here.w,
  )
}

/** Water that soaks between this cell and one neighbour this step, plus the ink it takes along. Positive flows in. */
const soakFromNeighbour = (uniforms: InkUniforms, here: Node<'vec4'>, permeability: FloatNode, dx: number, dy: number) => {
  const { spreadRate, dryWater, pinWater } = uniforms.settings.ink
  const neighbourUv = inkNeighbourUv(uniforms, dx, dy)
  const neighbour = uniforms.state.sample(neighbourUv)
  const rate = permeability.add(uniforms.paper.sample(neighbourUv).y).mul(spreadRate.mul(0.5))
  // Pinning: a wet edge only creeps into dry paper when there's plenty of water behind it.
  const edgeCreep = smoothstep(pinWater, pinWater.mul(2), max(here.x, neighbour.x))
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
  for (const [dx, dy] of neighbourOffsets) around = around.add(uniforms.state.sample(inkNeighbourUv(uniforms, dx, dy, 2)).x)
  const rim = clamp(water.sub(around.mul(0.25)).div(max(water, 0.01)), 0, 1)
  return rim.mul(step(uniforms.settings.ink.dryWater, water))
}

/** Share of the floating ink that settles into the paper this frame. Low spots and wet edges take more. */
const settlingShare = (uniforms: InkUniforms, water: FloatNode, height: FloatNode) => {
  const { depositPerSecond, granulation, edgeDarkening, dryWater, dryingSpeed } = uniforms.settings.ink
  const lowSpot = max(height.oneMinus().sub(0.5).mul(granulation.mul(2)).add(1), 0.1)
  const rate = lowSpot.mul(wetEdge(uniforms, water).mul(edgeDarkening).add(1)).mul(depositPerSecond).mul(dryingSpeed)
  // Once the water is nearly gone, all the floating ink dries into the paper.
  const drying = smoothstep(dryWater, dryWater.mul(6), water).oneMinus()
  return clamp(rate.mul(uniforms.frameSeconds).add(drying), 0, 1)
}

/**
 * Deposited ink left after its fade at `age`: all of it while it holds, then `maxDeposit` is taken away over
 * `fadeSeconds`, so the darkest cell is clean paper by about 30 s. Worked out from the age instead of subtracted each
 * frame, because a 144 Hz frame's share of the fade is under half a half-float step and would round away (ticket 18).
 */
export const fadeDeposit = (uniforms: InkUniforms, deposit: FloatNode, age: FloatNode) => {
  const { holdSeconds, fadeSeconds, maxDeposit } = uniforms.settings.ink
  return max(deposit.sub(max(age.sub(holdSeconds), 0).mul(maxDeposit.div(fadeSeconds))), 0)
}

/**
 * Settle: water evaporates, ink deposits into the paper and dries, and dried ink ages. Fresh ink lands on what's left
 * of the faded ink and restarts the age; fully faded ink is cleared, so a longer hold or fade set in the dev tuning
 * panel can't bring it back. The age grows in whole age ticks up to its cap, so it stays exact in the half float
 * (`InkAgeClock`).
 */
export const createSettleNode = (uniforms: InkUniforms) => {
  const { evaporationPerSecond, evaporationShare, dryingSpeed, maxDeposit } = uniforms.settings.ink
  const here = uniforms.state.sample(screenUV)
  const height = uniforms.paper.sample(screenUV).x
  const evaporation = here.x.mul(evaporationShare).add(evaporationPerSecond).mul(dryingSpeed).mul(uniforms.frameSeconds)
  const water = max(here.x.sub(evaporation), 0)
  const settled = here.y.mul(settlingShare(uniforms, water, height))
  const settledHere = step(1e-4, settled)
  const faded = fadeDeposit(uniforms, here.z, here.w)
  const kept = mix(select(faded.greaterThan(0), here.z, float(0)), faded, settledHere)
  const age = mix(min(here.w.add(uniforms.agingSeconds), uniforms.ageCapSeconds), float(0), settledHere)
  return vec4(water, here.y.sub(settled), min(kept.add(settled), maxDeposit), age)
}
