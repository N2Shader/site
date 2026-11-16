// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { hasPngAlphaChannel, isPngFile, readPngSize } from './PngHeader'
import { readPublicFile } from './PublicFiles'

const SMALLEST_TAB_ICON_PX = 16
// Strokes thinner than about a pixel in the smallest tab icon come out as faint grey.
const MIN_STROKE_PX_IN_SMALLEST_TAB = 0.9

const readFaviconSvgText = async () => (await readPublicFile('favicon.svg')).toString('utf8')

// The root <svg>'s attribute value; the favicon keeps its stroke and viewBox there.
const readSvgRootAttribute = (svgText: string, attributeName: string) =>
  new RegExp(`<svg[^>]*\\s${attributeName}="([^"]+)"`).exec(svgText)?.[1]

const readViewBoxWidth = (svgText: string) => Number(readSvgRootAttribute(svgText, 'viewBox')?.split(/\s+/)[2])

const readDarkSchemeRules = (svgText: string) => /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([\s\S]*?)\}\s*\}/.exec(svgText)?.[1]

describe('favicon.svg', () => {
  it('draws lines about a pixel wide in a 16px tab', async () => {
    const svgText = await readFaviconSvgText()

    const strokeWidth = Number(readSvgRootAttribute(svgText, 'stroke-width'))
    const strokePxInSmallestTab = (strokeWidth / readViewBoxWidth(svgText)) * SMALLEST_TAB_ICON_PX
    expect(strokePxInSmallestTab).toBeGreaterThanOrEqual(MIN_STROKE_PX_IN_SMALLEST_TAB)
  })

  it('switches from black to the paper colour on dark tabs', async () => {
    const svgText = await readFaviconSvgText()

    expect(readSvgRootAttribute(svgText, 'stroke')).toBe('#000')
    expect(readDarkSchemeRules(svgText)).toMatch(/\bsvg\b[^{]*\{[^}]*stroke:\s*#f4f2ee/)
  })
})

describe('apple-touch-icon.png', () => {
  it('is a 180×180 PNG with no transparency, which iOS would fill with black', async () => {
    const pngBytes = await readPublicFile('apple-touch-icon.png')

    expect(isPngFile(pngBytes)).toBe(true)
    expect(readPngSize(pngBytes)).toEqual({ width: 180, height: 180 })
    expect(hasPngAlphaChannel(pngBytes)).toBe(false)
  })
})
