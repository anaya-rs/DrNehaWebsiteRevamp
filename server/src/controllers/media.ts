import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import { processImage } from '../services/image'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')

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

    res.json({
      success: true,
      data: media,
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

    let originalUrl: string
    let thumbnailUrl: string
    let width: number | undefined
    let height: number | undefined

    if (isImage) {
      const processed = await processImage(file.path, file.filename)
      originalUrl = processed.originalUrl
      thumbnailUrl = processed.thumbnailUrl
      width = processed.width
      height = processed.height
    } else {
      // Video: store as-is
      originalUrl = `/uploads/originals/${file.filename}`
      thumbnailUrl = `/uploads/originals/${file.filename}`
    }

    const { altText = '', category = 'Uncategorized', isFeatured } = req.body

    const media = await prisma.media.create({
      data: {
        filename: file.filename,
        originalUrl,
        thumbnailUrl,
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

    res.status(201).json({ success: true, data: media })
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

    res.json({ success: true, data: updated })
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

    // Delete files from disk
    const originalPath = path.join(UPLOAD_DIR, 'originals', existing.filename)
    const thumbnailPath = path.join(UPLOAD_DIR, 'thumbnails', existing.filename)

    // Also handle processed .jpg filename
    const baseName = path.parse(existing.filename).name
    const processedFilename = `${baseName}.jpg`
    const processedOriginal = path.join(UPLOAD_DIR, 'originals', processedFilename)
    const processedThumbnail = path.join(UPLOAD_DIR, 'thumbnails', processedFilename)

    for (const filePath of [originalPath, thumbnailPath, processedOriginal, processedThumbnail]) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (e) {
          console.warn('[Media] Could not delete file:', filePath)
        }
      }
    }

    await prisma.media.delete({ where: { id } })
    await logActivity('DELETE', 'Media', `Deleted media: ${existing.filename}`, id)

    res.json({ success: true, data: { message: 'Media deleted' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
