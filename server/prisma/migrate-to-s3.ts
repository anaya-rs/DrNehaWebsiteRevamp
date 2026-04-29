/**
 * One-off migration: upload locally-stored Media to S3.
 *
 * Walks every Media row with storage='local', pushes the matching files from
 * UPLOAD_DIR up to S3 using the same key pattern as new uploads, flips the
 * row to storage='s3' with the keys, and (optionally) deletes the local
 * copies once the row is successfully migrated.
 *
 * Safe to re-run: rows already at storage='s3' are skipped, and each upload
 * first checks whether the key already exists in the bucket.
 *
 * Usage:
 *   MEDIA_STORAGE=s3 AWS_S3_BUCKET=... AWS_ACCESS_KEY_ID=... \
 *   AWS_SECRET_ACCESS_KEY=... AWS_REGION=ap-south-1 \
 *   npx ts-node server/prisma/migrate-to-s3.ts
 *
 * Flags:
 *   --dry-run     Show what would happen, don't upload or mutate anything.
 *   --keep-local  After migration succeeds, leave the local files in place
 *                 (default is to delete them so S3 is the source of truth).
 */

import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import { contentTypeFor, objectExists, uploadFile } from '../src/services/s3'

const prisma = new PrismaClient()

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads')

const args = new Set(process.argv.slice(2))
const DRY_RUN = args.has('--dry-run')
const KEEP_LOCAL = args.has('--keep-local')

function logStep(prefix: string, msg: string) {
  console.log(`${prefix} ${msg}`)
}

async function migrateOne(m: {
  id: string
  filename: string
  type: string
  originalUrl: string
  thumbnailUrl: string
}): Promise<'migrated' | 'skipped' | 'failed'> {
  const isVideo = m.type === 'video'

  // Figure out where the files live on disk. We try the DB filename first,
  // then fall back to the filename embedded in originalUrl (e.g. legacy rows
  // where `filename` is the pre-processed upload and the real file on disk
  // is the Sharp-processed .jpg).
  const candidateNames = [m.filename, path.basename(m.originalUrl)].filter(
    (v, i, a) => !!v && a.indexOf(v) === i,
  )

  let localOriginalPath: string | null = null
  let displayFilename: string | null = null
  for (const name of candidateNames) {
    const p = path.join(UPLOAD_DIR, 'originals', name)
    if (fs.existsSync(p)) {
      localOriginalPath = p
      displayFilename = name
      break
    }
  }

  if (!localOriginalPath || !displayFilename) {
    logStep('  ✗', `no local original found for Media ${m.id} (${m.filename})`)
    return 'failed'
  }

  const ext = path.extname(displayFilename).toLowerCase() || (isVideo ? '' : '.jpg')
  const keyBase = `media/${path.parse(displayFilename).name}`
  const origKey = `${keyBase}/original${ext}`
  const thumbKey = isVideo ? origKey : `${keyBase}/thumbnail${ext}`

  const ct = contentTypeFor(displayFilename)

  const localThumbnailPath = isVideo
    ? localOriginalPath
    : path.join(UPLOAD_DIR, 'thumbnails', displayFilename)

  if (!isVideo && !fs.existsSync(localThumbnailPath)) {
    logStep(
      '  ✗',
      `thumbnail missing for Media ${m.id} (expected ${localThumbnailPath})`,
    )
    return 'failed'
  }

  if (DRY_RUN) {
    logStep('  ·', `would upload ${localOriginalPath} → ${origKey}`)
    if (!isVideo) logStep('  ·', `would upload ${localThumbnailPath} → ${thumbKey}`)
    return 'migrated'
  }

  // Upload original (skip if it's already there — idempotent re-runs)
  let originalKey: string
  if (await objectExists(origKey)) {
    logStep('  =', `original already in S3 at ${origKey}`)
    originalKey = origKey
  } else {
    originalKey = await uploadFile(localOriginalPath, origKey, ct)
    logStep('  ↑', `uploaded ${origKey}`)
  }

  let thumbnailKey: string
  if (isVideo) {
    thumbnailKey = originalKey
  } else if (await objectExists(thumbKey)) {
    logStep('  =', `thumbnail already in S3 at ${thumbKey}`)
    thumbnailKey = thumbKey
  } else {
    thumbnailKey = await uploadFile(localThumbnailPath, thumbKey, ct)
    logStep('  ↑', `uploaded ${thumbKey}`)
  }

  await prisma.media.update({
    where: { id: m.id },
    data: { storage: 's3', originalKey, thumbnailKey },
  })

  if (!KEEP_LOCAL) {
    try {
      fs.unlinkSync(localOriginalPath)
      if (!isVideo && fs.existsSync(localThumbnailPath)) {
        fs.unlinkSync(localThumbnailPath)
      }
    } catch (e) {
      logStep('  !', `couldn't remove local files for ${m.id}: ${(e as Error).message}`)
    }
  }

  return 'migrated'
}

async function main() {
  console.log(
    `\nMedia → S3 migration${DRY_RUN ? ' (DRY RUN)' : ''}${KEEP_LOCAL ? ' [keep-local]' : ''}\n`,
  )

  if (!DRY_RUN && process.env.MEDIA_STORAGE !== 's3') {
    console.error(
      'Refusing to run: MEDIA_STORAGE must be "s3" in the environment for a real migration.',
    )
    console.error('Pass --dry-run to preview without MEDIA_STORAGE set.')
    process.exit(1)
  }

  const pending = await prisma.media.findMany({
    where: { storage: 'local' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      filename: true,
      type: true,
      originalUrl: true,
      thumbnailUrl: true,
    },
  })

  console.log(`${pending.length} local media row(s) to migrate.\n`)

  const counts = { migrated: 0, skipped: 0, failed: 0 }

  for (const m of pending) {
    console.log(`• ${m.id}  ${m.filename}  (${m.type})`)
    try {
      const result = await migrateOne(m)
      counts[result]++
    } catch (err) {
      counts.failed++
      logStep('  ✗', `error: ${(err as Error).message}`)
    }
  }

  console.log('\nDone.')
  console.log(
    `  migrated: ${counts.migrated}   skipped: ${counts.skipped}   failed: ${counts.failed}`,
  )

  await prisma.$disconnect()
  if (counts.failed > 0) process.exit(2)
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
