import type { Node } from 'three/webgpu'
import { dot, float, floor, fract, mix, sin, vec2 } from 'three/tsl'

type Vec2Node = Node<'vec2'>
type FloatNode = Node<'float'>

/** Pseudo-random value in 0–1 for each integer cell. Stable across frames, so the grain never moves. */
export const hashCell = (cell: Vec2Node): FloatNode =>
  fract(sin(dot(cell, vec2(127.1, 311.7))).mul(43758.5453))

/** Smooth value noise in 0–1. */
export const valueNoise = (position: Vec2Node): FloatNode => {
  const cell = floor(position)
  const local = fract(position)
  const blend = local.mul(local).mul(float(3).sub(local.mul(2)))
  const corner = (x: number, y: number) => hashCell(cell.add(vec2(x, y)))
  const bottom = mix(corner(0, 0), corner(1, 0), blend.x)
  const top = mix(corner(0, 1), corner(1, 1), blend.x)
  return mix(bottom, top, blend.y)
}

/** Fractal value noise in about 0–1: `octaves` layers, each twice as fine and half as strong. */
export const fractalNoise = (position: Vec2Node, octaves: number): FloatNode => {
  let total: FloatNode = float(0)
  let weightSum = 0
  for (let octave = 0; octave < octaves; octave += 1) {
    const weight = 0.5 ** octave
    // Each octave is shifted so the layers don't line up at the origin.
    total = total.add(valueNoise(position.mul(2 ** octave).add(vec2(octave * 17.3, octave * 9.1))).mul(weight))
    weightSum += weight
  }
  return total.div(weightSum)
}
