import { Pane } from 'tweakpane'
import type { ButtonApi, FolderApi } from 'tweakpane'
import { formatPaintingSettingsSnippet, paintingSettingGroups } from './PaintingSettingsSnippet'
import type { PaintingSettingGroupName } from './PaintingSettingsSnippet'
import { readQualityTierName } from './QualityTier'
import type { QualityTierChoice } from './QualityTier'
import type { SceneTuning } from './SceneAdapter'
import { SceneSettings } from './SceneSettings'

/**
 * The dev tuning panel for the ink painting (ticket 17). Only `nuxt dev` with `#debug` in the URL loads this file, so
 * Tweakpane never reaches the production bundle. The sliders edit `SceneSettings` in place, and the scene picks the new
 * values up at once.
 */

/** A settings group as the panel edits it: the `as const` types are read-only, the object itself isn't. */
type EditableSettingGroup = Record<string, number | string>

/** Counts that stay whole numbers, with the smallest value that still makes a path. */
const wholeNumberFloors: Partial<Record<string, number>> = { bendKnots: 1, samples: 2 }

/** Values the shaders divide by or use as a smoothstep edge: they stop at 1% of their default instead of 0. */
const aboveZeroSettings = new Set(['radiusOfShortSide', 'dryLoad', 'wetWater', 'pinWater', 'fadeSeconds'])

/** Every value runs from 0 (or its floor) to 5× its default. */
const rangeMultiplier = 5

const gsapEaseFamilies = ['power1', 'power2', 'power3', 'power4', 'sine', 'expo', 'circ', 'back', 'elastic', 'bounce']

const introStrokeEaseOptions = Object.fromEntries(['none', ...gsapEaseFamilies.flatMap(family =>
  ['in', 'out', 'inOut'].map(direction => `${family}.${direction}`))].map(ease => [ease, ease]))

const readNumberBindingParams = (key: string, defaultValue: number) => {
  const floor = wholeNumberFloors[key]
  const max = defaultValue * rangeMultiplier
  if (floor !== undefined) return { min: floor, max, step: 1 }
  return { min: aboveZeroSettings.has(key) ? defaultValue / 100 : 0, max }
}

const addSettingBinding = (folder: FolderApi, group: EditableSettingGroup, key: string, onChange: () => void) => {
  const value = group[key]
  const params = typeof value === 'number' ? readNumberBindingParams(key, value) : { options: introStrokeEaseOptions }
  folder.addBinding(group, key, params).on('change', onChange)
}

const addSettingFolder = (pane: Pane, groupName: PaintingSettingGroupName, tuning: SceneTuning) => {
  const folder = pane.addFolder({ title: groupName, expanded: false })
  const group = SceneSettings[groupName] as unknown as EditableSettingGroup
  for (const key of Object.keys(group)) addSettingBinding(folder, group, key, tuning.applyTunedSettings)
}

/** Kept for the page's life: the panel comes back after a still frame, and the scene keeps the forced tier. */
const qualityTierChoice: { qualityTier: QualityTierChoice } = { qualityTier: 'auto' }

const addQualityTierChoice = (pane: Pane, tuning: SceneTuning) => {
  const options = { [`auto (${readQualityTierName(window)})`]: 'auto', high: 'high', low: 'low' }
  pane.addBinding(qualityTierChoice, 'qualityTier', { label: 'quality tier', options })
    .on('change', event => tuning.useQualityTier(event.value))
}

const copySnippet = async (button: ButtonApi) => {
  try {
    await navigator.clipboard.writeText(formatPaintingSettingsSnippet())
    button.title = 'Copied'
  }
  catch {
    button.title = 'Copy failed'
  }
}

const addCopySnippetButton = (pane: Pane) => {
  const button = pane.addButton({ title: 'Copy as snippet' })
  button.on('click', () => {
    void copySnippet(button)
  })
}

/**
 * Keeps the brush off the panel: entering it ends the visitor's stroke, a hover over it paints nothing, and a press that starts
 * on it (dragging a slider) paints nothing until it lets go. Tweakpane drags with mouse and touch events, so stopping
 * the pointer events doesn't stop the drag. Returns a function that removes the listeners.
 */
const keepBrushOffPanel = (panelElement: HTMLElement, liftBrush: () => void) => {
  let isPressOnPanel = false
  const stopAtPanel = (event: PointerEvent) => event.stopPropagation()
  const startPressOnPanel = (event: PointerEvent) => {
    isPressOnPanel = true
    event.stopPropagation()
  }
  const stopHeldPress = (event: PointerEvent) => {
    if (isPressOnPanel) event.stopPropagation()
  }
  const endHeldPress = (event: PointerEvent) => {
    if (!isPressOnPanel) return
    isPressOnPanel = false
    event.stopPropagation()
  }
  const capture = { capture: true }

  // `pointerenter` fires once on the way in, not per child, so a replayed intro stroke keeps playing under a hover.
  panelElement.addEventListener('pointerenter', liftBrush)
  panelElement.addEventListener('pointerdown', startPressOnPanel)
  panelElement.addEventListener('pointermove', stopAtPanel)
  window.addEventListener('pointermove', stopHeldPress, capture)
  window.addEventListener('pointerup', endHeldPress, capture)
  window.addEventListener('pointercancel', endHeldPress, capture)

  return () => {
    window.removeEventListener('pointermove', stopHeldPress, capture)
    window.removeEventListener('pointerup', endHeldPress, capture)
    window.removeEventListener('pointercancel', endHeldPress, capture)
  }
}

/** Mounts the panel in Tweakpane's default spot (top-right), open. Returns a function that removes it. */
export const mountPaintingTuningPanel = (tuning: SceneTuning) => {
  const pane = new Pane({ title: 'Painting', expanded: true })
  pane.addButton({ title: 'Clear the ink' }).on('click', tuning.clearInk)
  pane.addButton({ title: 'Replay intro stroke' }).on('click', tuning.replayIntroStroke)
  addQualityTierChoice(pane, tuning)
  addCopySnippetButton(pane)
  for (const groupName of paintingSettingGroups) addSettingFolder(pane, groupName, tuning)
  const stopKeepingBrushOff = keepBrushOffPanel(pane.element, tuning.liftBrush)

  return () => {
    stopKeepingBrushOff()
    pane.dispose()
  }
}
