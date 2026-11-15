import { SceneSettings } from './SceneSettings'

const waitForPageLoad = (onLoaded: () => void) => {
  if (document.readyState === 'complete') {
    onLoaded()
    return () => {}
  }
  window.addEventListener('load', onLoaded, { once: true })
  return () => window.removeEventListener('load', onLoaded)
}

const waitForIdleCallback = (onIdle: () => void) => {
  // Safari has no requestIdleCallback; the DOM types say every browser does, hence the typeof check.
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(onIdle, { timeout: SceneSettings.idleTimeoutMs })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = setTimeout(onIdle, 1)
  return () => clearTimeout(handle)
}

/** Calls `onIdle` once the page has loaded and the browser is idle, so the scene never competes with first paint. Returns a cancel function. */
export const whenBrowserIdle = (onIdle: () => void) => {
  let cancelIdle = () => {}
  const cancelLoad = waitForPageLoad(() => {
    cancelIdle = waitForIdleCallback(onIdle)
  })
  return () => {
    cancelLoad()
    cancelIdle()
  }
}
