import { SceneSettings } from './SceneSettings'

/** The `SceneSettings` groups the dev tuning panel edits (ticket 17), in the order they sit in SceneSettings.ts. */
export const paintingSettingGroups = ['brush', 'introStroke', 'flow', 'ink', 'look'] as const

export type PaintingSettingGroupName = (typeof paintingSettingGroups)[number]

/** Six significant digits: drops float noise such as 0.30000000000000004 without changing a tuned value. */
const formatSettingValue = (value: unknown) =>
  typeof value === 'number' ? String(Number(value.toPrecision(6))) : `'${String(value)}'`

const formatSettingGroup = (groupName: PaintingSettingGroupName) => [
  `  ${groupName}: {`,
  ...Object.entries(SceneSettings[groupName]).map(([key, value]) => `    ${key}: ${formatSettingValue(value)},`),
  '  },',
].join('\n')

/**
 * The five painting groups with their current values, as TypeScript to paste over the same groups in SceneSettings.ts.
 * The doc comments aren't in it; put them back when pasting.
 */
export const formatPaintingSettingsSnippet = () => paintingSettingGroups.map(formatSettingGroup).join('\n\n')
