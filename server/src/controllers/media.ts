import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import { processImage } from '../services/image'
import {
  MEDIA_STORAGE,
  uploadFile as s3Upload,
  deleteObject as s3Delete,
  getSignedUrl as s3SignedUrl,
  contentTypeFor,
} from '../services/s3'
import { hydrateMediaItem, hydrateMediaItems } from '../utils/mediaHydrate'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')

// ─── Helpers ───────────────────────────────────────────────────────────────

function safeUnlink(p: string) {
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p)
  } catch (e) {
    console.warn('[Media] Could not delete local file:', p, e)
  }
}

// ─── Handlers ──────────────────────────────────────────────────────────────

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { category, type, page = '1', limit = '20' } = req.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (type) where.type = type

    const [total, media] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ])

    const hydrated = await hydrateMediaItems(media)

    res.json({
      success: true,
      data: hydrated,
      meta: { total, page: pageNum, limit: limitNum },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function upload(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Record<string, Express.Multer.File[]>
    const fileArray = files?.file

    if (!fileArray || fileArray.length === 0) {
      res.status(400).json({ success: false, error: 'No file uploaded' })
      return
    }

    const file = fileArray[0]
    const isVideo = file.mimetype.startsWith('video/')
    const isImage = file.mimetype.startsWith('image/')

    let localOriginalPath: string
    let localThumbnailPath: string
    let displayFilename: string
    let width: number | undefined
    let height: number | undefined

    if (isImage) {
      const processed = await processImage(file.path, file.filename)
      const processedName = path.basename(processed.originalUrl)
      displayFilename = processedName
      localOriginalPath = path.join(UPLOAD_DIR, 'originals', processedName)
      localThumbnailPath = path.join(UPLOAD_DIR, 'thumbnails', processedName)
      width = processed.width
      height = processed.height
    } else {
      // Video: multer has already saved it untouched
      displayFilename = file.filename
      localOriginalPath = path.join(UPLOAD_DIR, 'originals', file.filename)
      localThumbnailPath = localOriginalPath // videos use the same file as their "thumbnail"
    }

    let storage: 'local' | 's3' = 'local'
    let originalKey: string | null = null
    let thumbnailKey: string | null = null
    let originalUrl: string
    let thumbnailUrl: string

    if (MEDIA_STORAGE === 's3') {
      // Push to S3, then clean up the local copies
      const keyBase = `media/${path.parse(displayFilename).name}`
      const ext = path.extname(displayFilename).toLowerCase() || (isImage ? '.jpg' : '')
      const origKey = `${keyBase}/original${ext}`
      const thumbKey = isVideo ? origKey : `${keyBase}/thumbnail${ext}`

      const ct = contentTypeFor(displayFilename)

      originalKey = await s3Upload(localOriginalPath, origKey, ct)
      thumbnailKey = isVideo
        ? originalKey
        : await s3Upload(localThumbnailPath, thumbKey, ct)

      originalUrl = await s3SignedUrl(originalKey)
      thumbnailUrl = thumbnailKey ? await s3SignedUrl(thumbnailKey) : originalUrl
      storage = 's3'

      // Remove local copies — S3 is the source of truth now
      safeUnlink(localOriginalPath)
      if (!isVideo) safeUnlink(localThumbnailPath)
    } else {
      // Local storage: keep the files and point URLs at /uploads/...
      originalUrl = `/uploads/originals/${displayFilename}`
      thumbnailUrl = isVideo
        ? `/uploads/originals/${displayFilename}`
        : `/uploads/thumbnails/${displayFilename}`
    }

    const { altText = '', category = 'Uncategorized', isFeatured } = req.body

    const media = await prisma.media.create({
      data: {
        filename: displayFilename,
        originalUrl,
        thumbnailUrl,
        originalKey,
        thumbnailKey,
        storage,
        altText,
        category,
        type: isVideo ? 'video' : 'image',
        size: file.size,
        width: width ?? null,
        height: height ?? null,
        isFeatured: isFeatured === 'true' || isFeatured === true,
      },
    })

    await logActivity('CREATE', 'Media', `Uploaded ${file.originalname}`, media.id)

    res.status(201).json({ success: true, data: await hydrateMediaItem(media) })
  } catch (err: any) {
    console.error('[Media] Upload error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function patch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { altText, category, isFeatured } = req.body

    const existing = await prisma.media.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Media not found' })
      return
    }

    const updated = await prisma.media.update({
      where: { id },
      data: {
        ...(altText !== undefined && { altText }),
        ...(category !== undefined && { category }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      },
    })

    res.json({ success: true, data: await hydrateMediaItem(updated) })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Keep these in sync with the public GalleryPage tabs (CATEGORY_MAP in src/App.tsx)
const DEFAULT_CATEGORIES = [
  'Gallery Photos',
  'Videos',
  'News Clippings',
  'Patient Testimonials',
  'Procedure Results',
]

async function getManagedCategories(): Promise<string[]> {
  const settings = await prisma.siteSettings.findUnique({
    where: { section: 'media_categories' },
  })
  if (
    settings &&
    settings.data &&
    typeof settings.data === 'object' &&
    'categories' in settings.data
  ) {
    const cats = (settings.data as any).categories
    if (Array.isArray(cats)) return cats.filter((c): c is string => typeof c === 'string')
  }
  return []
}

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    // Persistent, admin-managed list (source of truth)
    const managed = await getManagedCategories()

    // Plus any categories that already exist on media rows (so nothing orphans)
    const used = await prisma.media.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })
    const usedList = used.map((c) => c.category).filter((c): c is string => !!c)

    // Seed with defaults on first run when nothing is managed yet
    const base = managed.length > 0 ? managed : DEFAULT_CATEGORIES

    // Merge, preserving order: managed/default first, then any stragglers
    const merged: string[] = []
    for (const c of [...base, ...usedList]) {
      if (!merged.includes(c)) merged.push(c)
    }

    res.json({ success: true, data: merged })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function saveCategories(req: Request, res: Response): Promise<void> {
  try {
    const { categories } = req.body

    if (!Array.isArray(categories)) {
      res.status(400).json({ success: false, error: 'categories must be an array' })
      return
    }

    // Normalise: trim, drop empties, dedupe (case-sensitive)
    const cleaned: string[] = []
    for (const raw of categories) {
      if (typeof raw !== 'string') continue
      const t = raw.trim()
      if (t && !cleaned.includes(t)) cleaned.push(t)
    }

    // Safety check: don't allow removing a category that still has media attached
    const inUse = await prisma.media.findMany({
      select: { category: true },
      distinct: ['category'],
    })
    const inUseList = inUse
      .map((m) => m.category)
      .filter((c): c is string => !!c)
    const stillReferenced = inUseList.filter((c) => !cleaned.includes(c))
    if (stillReferenced.length) {
      res.status(400).json({
        success: false,
        error:
          'Cannot remove categories that still contain media: ' +
          stillReferenced.join(', '),
      })
      return
    }

    const settings = await prisma.siteSettings.upsert({
      where: { section: 'media_categories' },
      update: { data: { categories: cleaned } },
      create: { section: 'media_categories', data: { categories: cleaned } },
    })

    await logActivity(
      'UPDATE',
      'SiteSettings',
      `Updated media categories: ${cleaned.join(', ')}`,
      settings.id,
    )

    res.json({ success: true, data: cleaned })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const existing = await prisma.media.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Media not found' })
      return
    }

    if (existing.storage === 's3') {
      // Blow away both the original and the thumbnail. If they're the same
      // key (videos) deleteObject on the same key twice is a no-op.
      if (existing.originalKey) await s3Delete(existing.originalKey)
      if (existing.thumbnailKey && existing.thumbnailKey !== existing.originalKey) {
        await s3Delete(existing.thumbnailKey)
      }
    } else {
      // Legacy local storage: also clear the filesystem
      const originalPath = path.join(UPLOAD_DIR, 'originals', existing.filename)
      const thumbnailPath = path.join(UPLOAD_DIR, 'thumbnails', existing.filename)

      // Also handle processed .jpg filename
      const baseName = path.parse(existing.filename).name
      const processedFilename = `${baseName}.jpg`
      const processedOriginal = path.join(UPLOAD_DIR, 'originals', processedFilename)
      const processedThumbnail = path.join(UPLOAD_DIR, 'thumbnails', processedFilename)

      for (const p of [originalPath, thumbnailPath, processedOriginal, processedThumbnail]) {
        safeUnlink(p)
      }
    }

    await prisma.media.delete({ where: { id } })
    await logActivity('DELETE', 'Media', `Deleted media: ${existing.filename}`, id)

    res.json({ success: true, data: { message: 'Media deleted' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
