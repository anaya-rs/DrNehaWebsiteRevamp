import { Media } from '@prisma/client'
import { getSignedUrl as s3SignedUrl } from '../services/s3'

/**
 * Return a Media row ready to send to the client. For S3-backed items we
 * replace the stored URLs with freshly-signed, short-lived URLs so the
 * browser can fetch them directly. Local-backed rows are returned as-is.
 */
export async function hydrateMediaItem(m: Media): Promise<Media> {
  if (m.storage !== 's3') return m
  const [originalUrl, thumbnailUrl] = await Promise.all([
    m.originalKey ? s3SignedUrl(m.originalKey) : Promise.resolve(m.originalUrl),
    m.thumbnailKey ? s3SignedUrl(m.thumbnailKey) : Promise.resolve(m.thumbnailUrl),
  ])
  return { ...m, originalUrl, thumbnailUrl }
}

export async function hydrateMediaItems(items: Media[]): Promise<Media[]> {
  return Promise.all(items.map(hydrateMediaItem))
}
