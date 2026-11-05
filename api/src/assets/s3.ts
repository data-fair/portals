import type { Readable } from 'node:stream'
import { DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { httpError } from '@data-fair/lib-express/index.js'
import config from '#config'

let _client: S3Client | undefined

const s3 = () => {
  if (!config.s3) throw httpError(501, 'assets storage is not configured')
  if (!_client) {
    _client = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      forcePathStyle: config.s3.forcePathStyle,
      credentials: config.s3.accessKeyId ? { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey as string } : undefined,
      // trailing checksums send aws-chunked bodies refused by several S3-compatible stores
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED'
    })
  }
  return { client: _client, Bucket: config.s3.bucket }
}

export const uploadObject = async (key: string, body: Readable, contentType: string) => {
  const { client, Bucket } = s3()
  await new Upload({ client, params: { Bucket, Key: key, Body: body, ContentType: contentType } }).done()
}

export const readObject = async (key: string, range?: string) => {
  const { client, Bucket } = s3()
  return await client.send(new GetObjectCommand({ Bucket, Key: key, Range: range }))
}

export const deleteObject = async (key: string) => {
  const { client, Bucket } = s3()
  await client.send(new DeleteObjectCommand({ Bucket, Key: key }))
}
