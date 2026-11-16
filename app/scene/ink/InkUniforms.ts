import { Texture, Vector2 } from 'three/webgpu'
import { screenUV, texture, uniform } from 'three/tsl'

/**
 * Inputs shared by every pass. Grids are read through one texture node each; the simulation points that node at the
 * current read target before each pass, so the ping-pong swap reaches every shader that samples it.
 *
 * Grid channels:
 * - paper: R height, G permeability, B mottle.
 * - state: R water, G floating ink, B deposited ink, A seconds since ink last settled here.
 * - velocity: RG water velocity in CSS pixels per second.
 * - curl, divergence, pressure: R.
 */
export const createInkUniforms = () => ({
  /** Viewport size in CSS pixels. */
  viewportSize: uniform(new Vector2(1, 1)),
  /** Size in CSS pixels of one flow cell and one paint cell. */
  flowCell: uniform(new Vector2(2, 2)),
  paintCell: uniform(new Vector2(1, 1)),
  /** Size of one paper texel in UV units, for its height gradient. */
  paperTexel: uniform(new Vector2(1, 1)),
  frameSeconds: uniform(1 / 60),
  /** Share of velocity kept this frame after friction. */
  frictionKeep: uniform(1),

  /** Brush line and state for this frame, in CSS pixels. Strength 0 means the brush lays nothing. */
  brushFrom: uniform(new Vector2()),
  brushTo: uniform(new Vector2()),
  brushVelocity: uniform(new Vector2()),
  brushRadius: uniform(10),
  brushStrength: uniform(0),
  brushLoad: uniform(1),

  paper: texture(new Texture()),
  state: texture(new Texture()),
  velocity: texture(new Texture()),
  curl: texture(new Texture()),
  divergence: texture(new Texture()),
  pressure: texture(new Texture()),
})

export type InkUniforms = ReturnType<typeof createInkUniforms>

/** This fragment's position in CSS pixels. Every pass covers the whole viewport, so it holds for any grid size. */
export const fragmentPixel = (uniforms: InkUniforms) => screenUV.mul(uniforms.viewportSize)
