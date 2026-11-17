import type { Node } from 'three/webgpu'
import { color, dot, floor, fract, length, max, min, mix, pow, screenUV, smoothstep, sqrt, vec2, vec4 } from 'three/tsl'
import { SceneSettings } from '../SceneSettings'
import { fadeDeposit } from './InkPasses'
import { hashCell } from './ShaderNoise'
import type { InkUniforms } from './InkUniforms'

type FloatNode = Node<'float'>

/** Light falls from the top left (UV y runs down the screen). */
const lightDirection = vec2(-0.6, -0.8)

/** Central difference of one channel, `step` UV apart. */
const slopeOf = (readAt: (uv: Node<'vec2'>) => FloatNode, step: Node<'vec2'>) => vec2(
  readAt(screenUV.add(vec2(step.x, 0))).sub(readAt(screenUV.sub(vec2(step.x, 0)))),
  readAt(screenUV.add(vec2(0, step.y))).sub(readAt(screenUV.sub(vec2(0, step.y)))),
)

/**
 * Kubelka-Munk reflectance of an opaque layer of ink, from its absorption-to-scattering ratio. Neutral, so ink runs
 * from paper white through greys to black without a colour cast.
 */
const kubelkaMunkReflectance = (uniforms: InkUniforms, density: FloatNode) => {
  const { inkAbsorption, inkToneExponent } = uniforms.settings.look
  const ratio = pow(density, inkToneExponent).mul(inkAbsorption)
  return ratio.add(1).sub(sqrt(ratio.mul(ratio).add(ratio.mul(2))))
}

/** The Kubelka-Munk greys, stretched so the ink is pure black at `blackDensity` and above. */
const inkReflectance = (uniforms: InkUniforms, density: FloatNode) => {
  const { blackDensity } = uniforms.settings.look
  const black = kubelkaMunkReflectance(uniforms, blackDensity)
  const reflectance = kubelkaMunkReflectance(uniforms, min(density, blackDensity))
  return max(reflectance.sub(black).div(max(black.oneMinus(), 1e-3)), 0)
}

/** Paper lit by its own height, tinted by its mottle. */
const shadePaper = (uniforms: InkUniforms, height: FloatNode, mottle: FloatNode) => {
  const { relief, mottle: mottleTint } = uniforms.settings.look
  const slope = slopeOf(uv => uniforms.paper.sample(uv).x, uniforms.paperTexel)
  const lighting = dot(slope, lightDirection).mul(relief.negate()).add(height.sub(0.5).mul(relief.mul(0.5))).add(1)
  return color(SceneSettings.paperColor).mul(lighting).mul(mottle.sub(0.5).mul(mottleTint.mul(-2)).add(1))
}

/** Gloss on wet ink, brightest where the water's surface tilts towards the light. */
const wetSheen = (uniforms: InkUniforms, water: FloatNode) => {
  const inkCellStep = uniforms.inkCell.div(uniforms.viewportSize)
  const surfaceTilt = dot(slopeOf(uv => uniforms.state.sample(uv).x, inkCellStep), lightDirection).negate()
  return smoothstep(0, 0.04, surfaceTilt).mul(smoothstep(0, 0.15, water)).mul(uniforms.settings.look.wetSheen)
}

/**
 * Deposited ink after its fade, blended between the four nearest ink cells by hand. The canvas has more pixels than
 * the ink grid, and the fade isn't linear in the stored deposit and age, so letting the texture filter blend those
 * first would thin every stroke's grey edge (clean paper next to it holds the oldest age).
 */
const sampleFadedDeposit = (uniforms: InkUniforms) => {
  const gridSize = uniforms.viewportSize.div(uniforms.inkCell)
  const cellPosition = screenUV.mul(gridSize).sub(0.5)
  const firstCell = floor(cellPosition)
  const blend = fract(cellPosition)
  const fadedCell = (dx: number, dy: number) => {
    const cell = uniforms.state.sample(firstCell.add(vec2(dx, dy)).add(0.5).div(gridSize))
    return fadeDeposit(uniforms, cell.z, cell.w)
  }
  return mix(mix(fadedCell(0, 0), fadedCell(1, 0), blend.x), mix(fadedCell(0, 1), fadedCell(1, 1), blend.x), blend.y)
}

/** Draw: the paper, the ink on it, a sheen on wet ink, a faint vignette and grain that doesn't move. */
export const createDrawNode = (uniforms: InkUniforms) => {
  const { floatingInkWeight, vignette, grain } = uniforms.settings.look
  const ink = uniforms.state.sample(screenUV)
  const paper = uniforms.paper.sample(screenUV)
  const granulation = paper.x.oneMinus().sub(0.5).mul(uniforms.settings.ink.granulation).add(1)
  const density = max(sampleFadedDeposit(uniforms).add(ink.y.mul(floatingInkWeight)), 0).mul(granulation)
  const inked = shadePaper(uniforms, paper.x, paper.z).mul(inkReflectance(uniforms, density)).add(wetSheen(uniforms, ink.x))
  const corner = smoothstep(0.3, 1, length(screenUV.sub(0.5)).mul(Math.SQRT2))
  const vignetted = inked.mul(corner.mul(vignette.negate()).add(1))
  const filmGrain = hashCell(floor(screenUV.div(uniforms.paperTexel))).sub(0.5).mul(grain)
  return vec4(vignetted.add(filmGrain), 1)
}
