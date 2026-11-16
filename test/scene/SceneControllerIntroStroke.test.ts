// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { disposeLiveControllers, moveMouseTo, resizeWindow, setupController, tapAt } from './SceneControllerHarness'

describe('SceneController intro stroke', () => {
  afterEach(() => {
    disposeLiveControllers()
    vi.useRealTimers()
  })

  it('plays the intro stroke once through the scene brush when the moving scene starts', async () => {
    const { adapter, intro, controller } = setupController()
    await controller.start()

    expect(intro.playIntroStroke).toHaveBeenCalledOnce()
    expect(intro.playIntroStroke).toHaveBeenCalledWith(expect.anything(), {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    })
    intro.plays[0]!.brush.moveBrush({ x: 300, y: 200 })
    intro.plays[0]!.brush.liftBrush()
    expect(adapter.moveBrush).toHaveBeenCalledWith({ x: 300, y: 200 })
    expect(adapter.liftBrush).toHaveBeenCalledOnce()
  })

  it('stops the intro stroke on a switch to reduced motion and never plays it twice', async () => {
    const { intro, motion, controller } = setupController()
    await controller.start()

    motion.setReducedMotion(true)
    expect(intro.plays[0]!.stop).toHaveBeenCalledOnce()

    motion.setReducedMotion(false)
    expect(intro.playIntroStroke).toHaveBeenCalledOnce()
  })

  it('plays the intro stroke the first time the moving scene starts, even after a still frame', async () => {
    const { intro, motion, controller } = setupController({ reduce: true })
    await controller.start()
    expect(intro.playIntroStroke).not.toHaveBeenCalled()

    motion.setReducedMotion(false)
    expect(intro.playIntroStroke).toHaveBeenCalledOnce()
  })

  it('stops the intro stroke on the first pointer move, lifting the brush so the two strokes never join', async () => {
    const { adapter, intro, controller } = setupController()
    await controller.start()
    const { stop } = intro.plays[0]!

    moveMouseTo(50, 60)
    moveMouseTo(55, 65)

    expect(stop).toHaveBeenCalledOnce()
    expect(adapter.liftBrush).toHaveBeenCalledOnce()
    expect(vi.mocked(adapter.liftBrush).mock.invocationCallOrder[0])
      .toBeLessThan(vi.mocked(adapter.moveBrush).mock.invocationCallOrder[0]!)
    expect(adapter.moveBrush).toHaveBeenLastCalledWith({ x: 55, y: 65 })
  })

  it('stops the intro stroke when a resize clears the paper', async () => {
    vi.useFakeTimers()
    const { intro, controller } = setupController()
    await controller.start()

    resizeWindow()
    vi.runAllTimers()

    expect(intro.plays[0]!.stop).toHaveBeenCalledOnce()
  })

  it('stops the intro stroke when disposed', async () => {
    const { intro, controller } = setupController()
    await controller.start()

    controller.dispose()

    expect(intro.plays[0]!.stop).toHaveBeenCalledOnce()
  })

  it('stops the intro stroke when the visitor taps without moving', async () => {
    const { intro, controller } = setupController()
    await controller.start()

    tapAt(40, 40)

    expect(intro.plays[0]!.stop).toHaveBeenCalledOnce()
  })
})
