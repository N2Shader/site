const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

// PNG colour types 4 and 6 carry an alpha channel; 0, 2 and 3 don't (3 can still add tRNS, which these files don't use).
const COLOUR_TYPES_WITH_ALPHA = [4, 6]

export const isPngFile = (pngBytes: Buffer) =>
  pngBytes.subarray(0, 8).equals(PNG_SIGNATURE) && pngBytes.toString('latin1', 12, 16) === 'IHDR'

// A PNG's first chunk is IHDR: its width and height are big-endian 32-bit numbers at bytes 16 and 20.
export const readPngSize = (pngBytes: Buffer) => ({
  width: pngBytes.readUInt32BE(16),
  height: pngBytes.readUInt32BE(20),
})

// The IHDR colour type is the byte at 25.
export const hasPngAlphaChannel = (pngBytes: Buffer) => COLOUR_TYPES_WITH_ALPHA.includes(pngBytes.readUInt8(25))
