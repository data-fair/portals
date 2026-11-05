import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

let client: S3Client | undefined

export const readAssetObject = async (key: string, range?: string) => {
  const config = useRuntimeConfig()
  if (!config.s3Bucket) throw createError({ status: 501, message: 'assets storage is not configured' })
  if (!client) {
    client = new S3Client({
      endpoint: config.s3Endpoint || undefined,
      region: config.s3Region,
      forcePathStyle: !!config.s3ForcePathStyle,
      credentials: config.s3AccessKeyId ? { accessKeyId: config.s3AccessKeyId, secretAccessKey: config.s3SecretAccessKey } : undefined,
      responseChecksumValidation: 'WHEN_REQUIRED'
    })
  }
  return await client.send(new GetObjectCommand({ Bucket: config.s3Bucket, Key: key, Range: range }))
}
