import sharp from 'sharp'
import fs from 'node:fs/promises'
import decodeIco from 'decode-ico'

export type ResizeInput = { filePath: string, width: number | undefined, height: number | undefined, mimetype?: string }
export type ResizeOutput = { width: number, height: number, mimeType: string, data: Buffer }

export default async (input: ResizeInput): Promise<ResizeOutput> => {
  if (input.mimetype === 'image/svg+xml') {
    const data = await fs.readFile(input.filePath)
    return { data, width: 0, height: 0, mimeType: 'image/svg+xml' }
  }

  let sharpImage: sharp.Sharp

  // ICO: extract largest image, handle both PNG-encoded and BMP-encoded frames
  if (input.mimetype === 'image/x-icon' || input.mimetype === 'image/vnd.microsoft.icon') {
    const icoBuffer = await fs.readFile(input.filePath)
    const images = decodeIco(icoBuffer)
    if (!images?.length) throw new Error('Invalid or empty ICO file')

    const largest = images.reduce((acc, cur) => (cur.width * cur.height > acc.width * acc.height ? cur : acc))
    const buf = Buffer.from(largest.data)

    sharpImage = largest.type === 'png'
      ? sharp(buf)
      : sharp(buf, { raw: { width: largest.width, height: largest.height, channels: 4 } })
  } else {
    sharpImage = sharp(input.filePath)
  }

  const resized = sharpImage.resize(input.width, input.height, { withoutEnlargement: true }).webp()
  const { width, height } = await resized.metadata()
  const data = await resized.toBuffer()

  return { data, width, height, mimeType: 'image/webp' }
}
