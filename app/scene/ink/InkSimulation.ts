import type { RenderTarget, WebGPURenderer } from 'three/webgpu'
import type { BrushDab } from '../BrushStroke'
import type { QualityTier } from '../QualityTier'
import { SceneSettings } from '../SceneSettings'
import type { SceneViewport } from '../SceneViewport'
import type { SimulationGrid } from '../SimulationGrid'
import { createDrawNode } from './DrawPass'
import { createAdvectVelocityNode, createCurlNode, createDivergenceNode, createPressureNode, createProjectNode } from './FlowPasses'
import { createCarryNode, createSettleNode, createSpreadNode } from './InkPasses'
import { createFullScreenPass, createGridTarget, createPingPongTarget } from './InkTargets'
import type { FullScreenPass, PingPongTarget } from './InkTargets'
import { createInkUniforms } from './InkUniforms'
import type { InkUniforms } from './InkUniforms'
import { createPaperNode } from './PaperPass'

/** Every grid for one sheet of paper. A new sheet (on resize) gets new grids at the new size. */
const createSheetTargets = (grid: SimulationGrid) => ({
  paper: createGridTarget(grid.paper),
  state: createPingPongTarget(grid.paint),
  velocity: createPingPongTarget(grid.flow),
  pressure: createPingPongTarget(grid.flow),
  curl: createGridTarget(grid.flow),
  divergence: createGridTarget(grid.flow),
})

type SheetTargets = ReturnType<typeof createSheetTargets>

const disposeSheetTargets = (targets: SheetTargets) => {
  targets.paper.dispose()
  targets.state.dispose()
  targets.velocity.dispose()
  targets.pressure.dispose()
  targets.curl.dispose()
  targets.divergence.dispose()
}

/** Points every shader's grid inputs at the grids to read from this pass. */
const bindReadTargets = (uniforms: InkUniforms, targets: SheetTargets) => {
  uniforms.paper.value = targets.paper.texture
  uniforms.state.value = targets.state.read.texture
  uniforms.velocity.value = targets.velocity.read.texture
  uniforms.pressure.value = targets.pressure.read.texture
  uniforms.curl.value = targets.curl.texture
  uniforms.divergence.value = targets.divergence.texture
}

const setSheetSize = (uniforms: InkUniforms, viewport: SceneViewport, grid: SimulationGrid) => {
  uniforms.viewportSize.value.set(viewport.width, viewport.height)
  uniforms.flowCell.value.set(viewport.width / grid.flow.width, viewport.height / grid.flow.height)
  uniforms.paintCell.value.set(viewport.width / grid.paint.width, viewport.height / grid.paint.height)
  uniforms.paperTexel.value.set(1 / grid.paper.width, 1 / grid.paper.height)
  uniforms.brushRadius.value = grid.brushRadius
}

const setFrame = (uniforms: InkUniforms, frameSeconds: number, dab: BrushDab | null) => {
  uniforms.frameSeconds.value = frameSeconds
  uniforms.frictionKeep.value = Math.exp(-SceneSettings.flow.frictionPerSecond * frameSeconds)
  uniforms.brushStrength.value = dab?.strength ?? 0
  if (!dab) return
  uniforms.brushFrom.value.set(dab.from.x, dab.from.y)
  uniforms.brushTo.value.set(dab.to.x, dab.to.y)
  uniforms.brushVelocity.value.set(dab.velocity.x, dab.velocity.y).multiplyScalar(SceneSettings.brush.velocityShare)
  uniforms.brushLoad.value = dab.load
}

const createSimulationPasses = (uniforms: InkUniforms) => ({
  paper: createFullScreenPass(createPaperNode(uniforms)),
  curl: createFullScreenPass(createCurlNode(uniforms)),
  advectVelocity: createFullScreenPass(createAdvectVelocityNode(uniforms)),
  divergence: createFullScreenPass(createDivergenceNode(uniforms)),
  pressure: createFullScreenPass(createPressureNode(uniforms)),
  project: createFullScreenPass(createProjectNode(uniforms)),
  carry: createFullScreenPass(createCarryNode(uniforms)),
  spread: createFullScreenPass(createSpreadNode(uniforms)),
  settle: createFullScreenPass(createSettleNode(uniforms)),
  draw: createFullScreenPass(createDrawNode(uniforms)),
})

/**
 * The black-ink painting simulation (ADR-0008): water flow, then carry, spread and settle the ink, then draw. Every
 * step is a full-screen pass into ping-pong render targets, so it runs on WebGPU and on the WebGL2 fallback. The quality
 * tier sets how many pressure and spread iterations run per frame.
 */
export const createInkSimulation = (
  renderer: WebGPURenderer,
  viewport: SceneViewport,
  grid: SimulationGrid,
  { pressureIterations, spreadIterations }: QualityTier,
) => {
  const uniforms = createInkUniforms()
  const passes = createSimulationPasses(uniforms)
  let targets = createSheetTargets(grid)

  const renderPass = (pass: FullScreenPass, target: RenderTarget | null) => {
    bindReadTargets(uniforms, targets)
    pass.renderInto(renderer, target)
  }

  const renderPingPong = (pass: FullScreenPass, target: PingPongTarget, iterations = 1) => {
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      renderPass(pass, target.write)
      target.swap()
    }
  }

  const clearTargets = (toClear: RenderTarget[]) => {
    renderer.setClearColor(0x000000, 0)
    for (const target of toClear) {
      renderer.setRenderTarget(target)
      renderer.clear()
    }
  }

  /** Wipes all water and ink, leaving clean paper. */
  const clearInk = () => {
    const { state, velocity, pressure, curl, divergence } = targets
    clearTargets([state.read, state.write, velocity.read, velocity.write, pressure.read, pressure.write, curl, divergence])
  }

  /** Makes the paper for the current grids and clears them of ink. */
  const prepareSheet = (sheetViewport: SceneViewport, sheetGrid: SimulationGrid) => {
    setSheetSize(uniforms, sheetViewport, sheetGrid)
    clearInk()
    renderPass(passes.paper, targets.paper)
  }

  /** A fresh sheet: new paper at the grid's size, with no ink on it. */
  const startSheet = (nextViewport: SceneViewport, nextGrid: SimulationGrid) => {
    disposeSheetTargets(targets)
    targets = createSheetTargets(nextGrid)
    prepareSheet(nextViewport, nextGrid)
  }

  const flowWater = () => {
    renderPass(passes.curl, targets.curl)
    renderPingPong(passes.advectVelocity, targets.velocity)
    renderPass(passes.divergence, targets.divergence)
    renderPingPong(passes.pressure, targets.pressure, pressureIterations)
    renderPingPong(passes.project, targets.velocity)
  }

  /** Advances the simulation by one frame, with what the brush laid in it. */
  const step = (frameSeconds: number, dab: BrushDab | null) => {
    setFrame(uniforms, frameSeconds, dab)
    flowWater()
    renderPingPong(passes.carry, targets.state)
    renderPingPong(passes.spread, targets.state, spreadIterations)
    renderPingPong(passes.settle, targets.state)
  }

  prepareSheet(viewport, grid)

  return {
    startSheet,
    clearInk,
    step,
    /** Draws the paper and its ink onto the canvas. */
    draw: () => renderPass(passes.draw, null),
    dispose: () => {
      disposeSheetTargets(targets)
      Object.values(passes).forEach(pass => pass.dispose())
    },
  }
}

export type InkSimulation = ReturnType<typeof createInkSimulation>
