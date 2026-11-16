import { readFile } from 'node:fs/promises'

// The bytes of a file in public/, as the site serves it.
export const readPublicFile = (fileName: string) => readFile(new URL(`../../public/${fileName}`, import.meta.url))
