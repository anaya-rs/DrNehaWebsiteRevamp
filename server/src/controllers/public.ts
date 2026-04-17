import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPageSection(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params

    const pageSection = await prisma.pageSection.findUnique({ where: { section } })
    if (!pageSection) {
      res.status(404).json({ success: false, error: `Section "${section}" not found` })
      return
    }

    res.json({ success: true, data: pageSection })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function getPosts(req: Request, res: Response): Promise<void> {
  try {
    const { status = 'published', limit = '10', page = '1', category } = req.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: any = { status }
    if (category) where.category = { contains: category, mode: 'insensitive' }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          tags: true,
          publishedAt: true,
          views: true,
        },
      }),
    ])

    res.json({
      success: true,
      data: posts,
      meta: { total, page: pageNum, limit: limitNum },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function getPost(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params

    const post = await prisma.post.findUnique({ where: { slug } })
    if (!post || post.status !== 'published') {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }

    // Increment views (fire-and-forget)
    prisma.post.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {})

    res.json({ success: true, data: post })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function getMedia(req: Request, res: Response): Promise<void> {
  try {
    const { category, type, limit = '20', page = '1' } = req.query as Record<string, string>

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

export async function getGallerySettings(_req: Request, res: Response): Promise<void> {
  try {
    let settings = await prisma.gallerySettings.findFirst()

    if (!settings) {
      settings = await prisma.gallerySettings.create({
        data: {
          layout: 'grid',
          columns: 3,
          showCaptions: true,
          showCategories: true,
          featuredOrder: [],
        },
      })
    }

    res.json({ success: true, data: settings })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

async function getSettingsSection(section: string, req: Request, res: Response): Promise<void> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { section } })
    if (!settings) {
      res.status(404).json({ success: false, error: `Settings "${section}" not found` })
      return
    }
    res.json({ success: true, data: settings.data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function getContact(req: Request, res: Response): Promise<void> {
  return getSettingsSection('contact', req, res)
}

export async function getClinics(req: Request, res: Response): Promise<void> {
  return getSettingsSection('clinics', req, res)
}

export async function getSocial(req: Request, res: Response): Promise<void> {
  return getSettingsSection('social', req, res)
}

export async function getEmergency(req: Request, res: Response): Promise<void> {
  return getSettingsSection('emergency', req, res)
}

export async function getAvailability(_req: Request, res: Response): Promise<void> {
  try {
    const blocks = await prisma.availabilityBlock.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    res.json({ success: true, data: blocks })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
