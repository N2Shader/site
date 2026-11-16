import { HalfFloatType, LinearFilter, NodeMaterial, QuadMesh, RenderTarget } from 'three/webgpu'
import type { Node, WebGPURenderer } from 'three/webgpu'
import type { GridSize } from '../SimulationGrid'

/** A half-float RGBA grid the passes render into. Half floats keep small amounts of water and ink from rounding away. */
export const createGridTarget = ({ width, height }: GridSize) => new RenderTarget(width, height, {
  type: HalfFloatType,
  depthBuffer: false,
  generateMipmaps: false,
  minFilter: LinearFilter,
  magFilter: LinearFilter,
})

/** Two grids that swap roles each pass: one is read while the other is written. */
export const createPingPongTarget = (size: GridSize) => {
  let read = createGridTarget(size)
  let write = createGridTarget(size)
  return {
    get read() {
      return read
    },
    get write() {
      return write
    },
    swap: () => {
      [read, write] = [write, read]
    },
    dispose: () => {
      read.dispose()
      write.dispose()
    },
  }
}

export type PingPongTarget = ReturnType<typeof createPingPongTarget>

/** A full-screen pass: one fragment shader drawn over the whole target. */
export const createFullScreenPass = (fragmentNode: Node) => {
  const material = new NodeMaterial()
  material.fragmentNode = fragmentNode
  material.depthTest = false
  material.depthWrite = false
  const quad = new QuadMesh(material)
  return {
    /** Draws the pass into `target`, or onto the canvas when `target` is `null`. */
    renderInto: (renderer: WebGPURenderer, target: RenderTarget | null) => {
      renderer.setRenderTarget(target)
      quad.render(renderer)
    },
    dispose: () => material.dispose(),
  }
}

export type FullScreenPass = ReturnType<typeof createFullScreenPass>
