export type BrushPoint = { x: number, y: number }

const toBrushPoint = (event: PointerEvent): BrushPoint => ({ x: event.clientX, y: event.clientY })

/**
 * Follows the first pointer on the window and reports where the brush moves.
 * Mouse and pen paint on hover; touch only fires moves while a finger is down, so it paints while dragging.
 * A second finger is ignored until the first one lifts. A hovering mouse hands the brush over to any pointer that
 * presses down, so touch still paints on laptops with a touchscreen. Returns a function that removes the listeners.
 */
export const listenForBrushPointer = (target: Window, onBrushMove: (point: BrushPoint) => void) => {
  let activePointerId: number | null = null
  let isActivePointerPressed = false

  /** Gives the brush to this pointer if nobody holds it, and says whether this pointer holds it now. */
  const claimBrushPointer = (event: PointerEvent) => {
    activePointerId ??= event.pointerId
    return activePointerId === event.pointerId
  }

  const releasePointer = (event: PointerEvent) => {
    if (event.pointerId !== activePointerId) return
    activePointerId = null
    isActivePointerPressed = false
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!isActivePointerPressed) activePointerId = event.pointerId
    isActivePointerPressed = true
  }

  const onPointerMove = (event: PointerEvent) => {
    if (claimBrushPointer(event)) onBrushMove(toBrushPoint(event))
  }

  // `pointerleave` doesn't bubble to window; `pointerout` with no related target means the pointer left the page.
  const onPointerOut = (event: PointerEvent) => {
    if (event.relatedTarget === null) releasePointer(event)
  }

  target.addEventListener('pointerdown', onPointerDown)
  target.addEventListener('pointermove', onPointerMove)
  target.addEventListener('pointerup', releasePointer)
  target.addEventListener('pointercancel', releasePointer)
  target.addEventListener('pointerout', onPointerOut)

  return () => {
    target.removeEventListener('pointerdown', onPointerDown)
    target.removeEventListener('pointermove', onPointerMove)
    target.removeEventListener('pointerup', releasePointer)
    target.removeEventListener('pointercancel', releasePointer)
    target.removeEventListener('pointerout', onPointerOut)
  }
}
