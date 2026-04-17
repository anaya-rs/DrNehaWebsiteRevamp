import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { slugify } from '../utils/slugify'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { status, search, page = '1', limit = '20', category } = req.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = { contains: category, mode: 'insensitive' }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          status: true,
          publishedAt: true,
          featuredImage: true,
          category: true,
          tags: true,
          views: true,
          createdAt: true,
          updatedAt: true,
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

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const {
      title,
      content,
      excerpt,
      status = 'draft',
      featuredImage,
      metaTitle,
      metaDesc,
      focusKeyword,
      tags,
      category = 'General',
    } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' })
      return
    }

    // Generate unique slug
    let baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 1
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const publishedAt = status === 'published' ? new Date() : null

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: content || {},
        excerpt: excerpt || '',
        status,
        publishedAt,
        featuredImage: featuredImage || null,
        metaTitle: metaTitle || '',
        metaDesc: metaDesc || '',
        focusKeyword: focusKeyword || '',
        tags: tags || [],
        category,
      },
    })

    await logActivity('CREATE', 'Post', `Created post: ${title}`, post.id)

    res.status(201).json({ success: true, data: post })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function get(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }

    res.json({ success: true, data: post })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const {
      title,
      content,
      excerpt,
      status,
      featuredImage,
      metaTitle,
      metaDesc,
      focusKeyword,
      tags,
      category,
    } = req.body

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }

    // Re-generate slug if title changed
    let slug = existing.slug
    if (title && title !== existing.title) {
      let baseSlug = slugify(title)
      slug = baseSlug
      let counter = 1
      while (true) {
        const conflict = await prisma.post.findUnique({ where: { slug } })
        if (!conflict || conflict.id === id) break
        slug = `${baseSlug}-${counter++}`
      }
    }

    // Set publishedAt when first published
    let publishedAt = existing.publishedAt
    if (status === 'published' && existing.status !== 'published' && !publishedAt) {
      publishedAt = new Date()
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title, slug }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(status !== undefined && { status }),
        ...(publishedAt !== existing.publishedAt && { publishedAt }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDesc !== undefined && { metaDesc }),
        ...(focusKeyword !== undefined && { focusKeyword }),
        ...(tags !== undefined && { tags }),
        ...(category !== undefined && { category }),
      },
    })

    await logActivity('UPDATE', 'Post', `Updated post: ${updated.title}`, id)

    res.json({ success: true, data: updated })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const existing = await prisma.post.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Post not found' })
      return
    }

    await prisma.post.delete({ where: { id } })
    await logActivity('DELETE', 'Post', `Deleted post: ${existing.title}`, id)

    res.json({ success: true, data: { message: 'Post deleted' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
