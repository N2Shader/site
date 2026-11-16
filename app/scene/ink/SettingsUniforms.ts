import { uniform } from 'three/tsl'
import { SceneSettings } from '../SceneSettings'

/** The `SceneSettings` groups whose numbers the shaders read. They're uniforms, so a retune reaches running shaders. */
const shaderSettingGroups = ['brush', 'flow', 'ink', 'look'] as const

type ShaderSettingGroupName = (typeof shaderSettingGroups)[number]

const createFloatUniform = (value: number) => uniform(value)

type FloatUniform = ReturnType<typeof createFloatUniform>

type NumberKeysOf<Group> = { [Key in keyof Group]: Group[Key] extends number ? Key : never }[keyof Group]

export type SettingsUniforms = {
  [GroupName in ShaderSettingGroupName]: { [Key in NumberKeysOf<(typeof SceneSettings)[GroupName]>]: FloatUniform }
}

const isNumberSetting = (entry: [string, unknown]): entry is [string, number] => typeof entry[1] === 'number'

const readNumberSettings = (groupName: ShaderSettingGroupName) =>
  Object.entries(SceneSettings[groupName] as Record<string, unknown>).filter(isNumberSetting)

/** One float uniform per number in the shader groups, starting at its `SceneSettings` value. */
export const createSettingsUniforms = () => Object.fromEntries(shaderSettingGroups.map(groupName => [
  groupName,
  Object.fromEntries(readNumberSettings(groupName).map(([key, value]) => [key, createFloatUniform(value)])),
])) as SettingsUniforms

/** Copies the current `SceneSettings` numbers into the uniforms (after the dev tuning panel changed them). */
export const syncSettingsUniforms = (settingsUniforms: SettingsUniforms) => {
  for (const groupName of shaderSettingGroups) {
    const groupUniforms: Record<string, FloatUniform> = settingsUniforms[groupName]
    for (const [key, value] of readNumberSettings(groupName)) groupUniforms[key]!.value = value
  }
}
