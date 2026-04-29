import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, S3ServiceException } from '@aws-sdk/client-s3'
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import path from 'path'

/**
 * S3 media storage.
 *
 * The rest of the app talks to this module, not to the AWS SDK directly, so we
 * have one place to change if we switch to a different provider later.
 *
 * Access pattern: uploads go to a **private** bucket. Read access is handed
 * out as short-lived signed URLs minted on demand. That way we don't need a
 * public-read bucket policy and the same code path handles public gallery
 * images and private testimonial videos.
 */

export const MEDIA_STORAGE: 'local' | 's3' =
  (process.env.MEDIA_STORAGE || 'local').toLowerCase() === 's3' ? 's3' : 'local'

const BUCKET = process.env.AWS_S3_BUCKET || ''
const REGION = process.env.AWS_REGION || 'ap-south-1'
const PREFIX = (process.env.AWS_S3_PREFIX || '').replace(/^\/+|\/+$/g, '') // strip slashes
const SIGN_TTL = parseInt(process.env.AWS_SIGNED_URL_TTL || '3600', 10)

let _client: S3Client | null = null
function client(): S3Client {
  if (_client) return _client
  if (MEDIA_STORAGE !== 's3') {
    throw new Error(
      '[s3] MEDIA_STORAGE is not "s3" — refusing to build an S3 client. Set MEDIA_STORAGE=s3 in .env.',
    )
  }
  if (!BUCKET) throw new Error('[s3] AWS_S3_BUCKET is not set in .env')
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('[s3] AWS credentials are not set (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)')
  }
  _client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  return _client
}

function withPrefix(key: string): string {
  const cleaned = key.replace(/^\/+/, '')
  return PREFIX ? `${PREFIX}/${cleaned}` : cleaned
}

/** Upload a local file to S3. Returns the stored key (with prefix applied). */
export async function uploadFile(
  localPath: string,
  key: string,
  contentType: string,
): Promise<string> {
  const stream = fs.createReadStream(localPath)
  const fullKey = withPrefix(key)
  await client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: fullKey,
      Body: stream,
      ContentType: contentType,
    }),
  )
  return fullKey
}

/** Upload a buffer to S3. Returns the stored key (with prefix applied). */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const fullKey = withPrefix(key)
  await client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: fullKey,
      Body: buffer,
      ContentType: contentType,
    }),
  )
  return fullKey
}

/** Delete an object. Missing keys are not an error. */
export async function deleteObject(key: string): Promise<void> {
  if (!key) return
  try {
    await client().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch (err) {
    if (err instanceof S3ServiceException && err.name === 'NoSuchKey') return
    throw err
  }
}

/** True if an object exists in the bucket. */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await client().send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return true
  } catch (err) {
    if (err instanceof S3ServiceException) {
      if (err.name === 'NotFound' || err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return false
      }
    }
    throw err
  }
}

/** Mint a short-lived GET URL for the given S3 key. */
export async function getSignedUrl(key: string, ttlSeconds: number = SIGN_TTL): Promise<string> {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return awsGetSignedUrl(client(), cmd, { expiresIn: ttlSeconds })
}

/** Guess a content-type from a filename extension. */
export function contentTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.mp4':
      return 'video/mp4'
    case '.mov':
      return 'video/quicktime'
    case '.avi':
      return 'video/x-msvideo'
    case '.pdf':
      return 'application/pdf'
    default:
      return 'application/octet-stream'
  }
}
