// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { isPngFile, readPngSize } from './PngHeader'
import { readPublicFile } from './PublicFiles'

describe.each(['en', 'es'])('share image for %s', (localeCode) => {
  it('is the 1200×630 PNG the og:image tags promise', async () => {
    const pngBytes = await readPublicFile(`share-image-${localeCode}.png`)

    expect(isPngFile(pngBytes)).toBe(true)
    expect(readPngSize(pngBytes)).toEqual({ width: 1200, height: 630 })
  })
})
