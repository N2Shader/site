// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { disposeLiveControllers, moveMouseTo, resizeWindow, setupController } from './SceneControllerHarness'

describe('SceneController', () => {
  afterEach(() => {
    disposeLiveControllers()
    vi.useRealTimers()
  })

  it('loads the scene at the viewport size and starts the frame loop', async () => {
    const { adapter, states, loadScene, controller } = setupController()

    await controller.start()

    expect(loadScene).toHaveBeenCalledWith({
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    })
    expect(adapter.startLoop).toHaveBeenCalledOnce()
    expect(states).toEqual(['running'])
  })

  it('reports failure and stays on the fallback backdrop when neither WebGPU nor WebGL2 starts', async () => {
    const { states, controller } = setupController({ loadFails: true })

    await controller.start()

    expect(states).toEqual(['failed'])
  })

  it('moves the brush when the pointer moves anywhere on the window', async () => {
    const { adapter, controller } = setupController()
    await controller.start()

    moveMouseTo(120, 80)

    expect(adapter.moveBrush).toHaveBeenCalledWith({ x: 120, y: 80 })
  })

  it('shows the still frame with no loop and no painting when the visitor asks for reduced motion', async () => {
    const { adapter, states, controller } = setupController({ reduce: true })
    await controller.start()

    moveMouseTo(10, 10)

    expect(adapter.renderStillFrame).toHaveBeenCalledOnce()
    expect(adapter.startLoop).not.toHaveBeenCalled()
    expect(adapter.moveBrush).not.toHaveBeenCalled()
    expect(states).toEqual(['still'])
  })

  it('switches between the moving scene and the still frame when the motion setting changes', async () => {
    const { adapter, motion, states, controller } = setupController()
    await controller.start()

    motion.setReducedMotion(true)
    moveMouseTo(10, 10)

    expect(adapter.stopLoop).toHaveBeenCalledOnce()
    expect(adapter.renderStillFrame).toHaveBeenCalledOnce()
    expect(adapter.moveBrush).not.toHaveBeenCalled()

    motion.setReducedMotion(false)

    expect(adapter.startLoop).toHaveBeenCalledTimes(2)
    expect(states).toEqual(['running', 'still', 'running'])
  })

  it('rebuilds the scene once at the new size after the resize settles', async () => {
    vi.useFakeTimers()
    const { adapter, controller } = setupController()
    await controller.start()

    window.happyDOM.setViewport({ width: 800, height: 600 })
    resizeWindow()
    window.happyDOM.setViewport({ width: 600, height: 800 })
    resizeWindow()

    expect(adapter.resize).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(adapter.resize).toHaveBeenCalledOnce()
    expect(adapter.resize).toHaveBeenCalledWith({ width: 600, height: 800, pixelRatio: Math.min(window.devicePixelRatio, 2) })
  })

  it('redraws the still frame after a resize when the visitor asks for reduced motion', async () => {
    vi.useFakeTimers()
    const { adapter, controller } = setupController({ reduce: true })
    await controller.start()

    resizeWindow()
    vi.runAllTimers()

    expect(adapter.resize).toHaveBeenCalledOnce()
    expect(adapter.renderStillFrame).toHaveBeenCalledTimes(2)
    expect(adapter.startLoop).not.toHaveBeenCalled()
  })

  it('stops the loop, frees the renderer and stops listening when disposed', async () => {
    vi.useFakeTimers()
    const { adapter, motion, controller } = setupController()
    await controller.start()

    controller.dispose()
    moveMouseTo(10, 10)
    resizeWindow()
    vi.runAllTimers()
    motion.setReducedMotion(true)

    expect(adapter.stopLoop).toHaveBeenCalledOnce()
    expect(adapter.dispose).toHaveBeenCalledOnce()
    expect(adapter.moveBrush).not.toHaveBeenCalled()
    expect(adapter.resize).not.toHaveBeenCalled()
    expect(adapter.renderStillFrame).not.toHaveBeenCalled()
  })

  it('frees a scene that finishes loading after it was disposed, without starting it', async () => {
    const { adapter, states, controller } = setupController()

    const starting = controller.start()
    controller.dispose()
    await starting

    expect(adapter.dispose).toHaveBeenCalledOnce()
    expect(adapter.startLoop).not.toHaveBeenCalled()
    expect(states).toEqual([])
  })
})
