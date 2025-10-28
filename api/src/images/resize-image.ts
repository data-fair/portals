import sharp from 'sharp'
import fs from 'node:fs/promises'

export type ResizeInput = { filePath: string, width: number | undefined, height: number | undefined, mimetype?: string }
export type ResizeOutput = { width: number, height: number, mimeType: string, data: Buffer }

export default async (input: ResizeInput): Promise<ResizeOutput> => {
  if (input.mimetype === 'image/svg+xml') {
    const data = await fs.readFile(input.filePath)
    return { data, width: 0, height: 0, mimeType: 'image/svg+xml' }
  }
  const sharpImage = sharp(input.filePath)
    .resize(input.width, input.height, { withoutEnlargement: true })
    .png()

  const { width, height } = await sharpImage.metadata()
  const data = await sharpImage.toBuffer()

  return { data, width, height, mimeType: 'image/png' }
}
