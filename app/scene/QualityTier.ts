import { SceneSettings } from './SceneSettings'

export type QualityTierName = keyof typeof SceneSettings.quality

/** Grid density and solver iterations for one quality tier. */
export type QualityTier = (typeof SceneSettings.quality)[QualityTierName]

/** What the browser says about the device. `undefined` means it doesn't report that value. */
export type DeviceCapabilities = {
  hasFinePointer: boolean
  cores: number | undefined
  memoryGb: number | undefined
}

/** A value the browser doesn't report doesn't count against the device. */
const meetsMinimum = (value: number | undefined, minimum: number) => value === undefined || value >= minimum

/** High needs a fine pointer and the cores and memory in `SceneSettings.highTier`, where the browser reports them. Low is everything else. */
export const pickQualityTierName = ({ hasFinePointer, cores, memoryGb }: DeviceCapabilities): QualityTierName => {
  const { minCores, minMemoryGb } = SceneSettings.highTier
  const isHigh = hasFinePointer && meetsMinimum(cores, minCores) && meetsMinimum(memoryGb, minMemoryGb)
  return isHigh ? 'high' : 'low'
}

/** `deviceMemory` is Chromium-only and missing from the DOM types. */
type NavigatorWithMemory = Navigator & { deviceMemory?: number }

const readDeviceCapabilities = (target: Window): DeviceCapabilities => {
  const navigator: NavigatorWithMemory = target.navigator
  return {
    hasFinePointer: target.matchMedia('(pointer: fine)').matches,
    cores: navigator.hardwareConcurrency || undefined,
    memoryGb: navigator.deviceMemory,
  }
}

/** The quality tier for this device, read once when the scene loads. */
export const readQualityTier = (target: Window): QualityTier =>
  SceneSettings.quality[pickQualityTierName(readDeviceCapabilities(target))]
