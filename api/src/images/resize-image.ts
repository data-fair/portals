import sharp from 'sharp'
import { resolve } from 'path'

export const filename = resolve(__filename)

export type ResizeInput = { filePath: string, width: number | undefined, height: number | undefined }
export type ResizeOutput = { width: number, height: number, mimeType: string, data: Buffer }

export default async (input: ResizeInput): Promise<ResizeOutput> => {
  const sharpImage = sharp(input.filePath)
    .resize(input.width, input.height)
    .png()

  const { width, height } = await sharpImage.metadata()
  const data = await sharpImage.toBuffer()

  return { data, width, height, mimeType: 'image/png' }
}
