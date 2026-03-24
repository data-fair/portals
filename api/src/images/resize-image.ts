import sharp from 'sharp'
import fs from 'node:fs/promises'
import decodeIco from 'decode-ico'

const MAX_INPUT_PIXELS = 512 * 1024 * 1024

export type ResizeInput = { filePath: string, width: number | undefined, height: number | undefined, mimetype?: string }
export type ResizeOutput = { width: number, height: number, mimeType: string, data: Buffer }

export default async (input: ResizeInput): Promise<ResizeOutput> => {
  try {
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
        ? sharp(buf, { limitInputPixels: MAX_INPUT_PIXELS })
        : sharp(buf, { raw: { width: largest.width, height: largest.height, channels: 4 }, limitInputPixels: MAX_INPUT_PIXELS })
    } else {
      const metadata = await sharp(input.filePath, { limitInputPixels: MAX_INPUT_PIXELS }).metadata()
      const isAnimated = (metadata.pages ?? 0) > 1
      sharpImage = sharp(input.filePath, { animated: isAnimated, limitInputPixels: MAX_INPUT_PIXELS })
    }

    const resized = sharpImage.resize(input.width, input.height, { withoutEnlargement: true }).webp()
    const { width, height } = await resized.metadata()
    const data = await resized.toBuffer()

    return { data, width, height, mimeType: 'image/webp' }
  } catch (err: any) {
    if (err?.message?.includes('pixel limit')) throw new Error('IMAGE_EXCEEDS_PIXEL_LIMIT')
    throw err
  }
}
