import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { slugify } from '../utils/slugify'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()

// ─── LIST ─────────────────────────────────────────────────────────
// Admin list: paginated, no body content (lightweight for table view).
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, specialities] = await Promise.all([
      prisma.speciality.count({ where }),
      prisma.speciality.findMany({
        where,
        orderBy: { title: 'asc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    res.json({
      success: true,
      data: specialities,
      meta: { total, page: pageNum, limit: limitNum },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Public list: returns all specialities (no pagination) with lightweight fields.
// Used by the public frontend to render the /services grid.
export async function publicList(_req: Request, res: Response): Promise<void> {
  try {
    const specialities = await prisma.speciality.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        image: true,
      },
    })
    res.json({ success: true, data: specialities })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─── CREATE ───────────────────────────────────────────────────────
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { title, slug, description, content, image } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' })
      return
    }

    if (!description) {
      res.status(400).json({ success: false, error: 'Description is required' })
      return
    }

    // Generate unique slug if not provided
    let finalSlug = slug || slugify(title)
    if (!slug) {
      const baseSlug = slugify(title)
      finalSlug = baseSlug
      let counter = 1
      while (await prisma.speciality.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter++}`
      }
    } else {
      const existing = await prisma.speciality.findUnique({ where: { slug: finalSlug } })
      if (existing) {
        res.status(400).json({ success: false, error: 'Slug must be unique' })
        return
      }
    }

    const speciality = await prisma.speciality.create({
      data: {
        title,
        slug: finalSlug,
        description,
        content: content || emptyDoc(),
        image: image || null,
      },
    })

    await logActivity('CREATE', 'Speciality', `Created speciality: ${title}`, speciality.id)

    res.status(201).json({ success: true, data: speciality })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─── GET (admin, by id) ───────────────────────────────────────────
export async function get(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const speciality = await prisma.speciality.findUnique({ where: { id } })
    if (!speciality) {
      res.status(404).json({ success: false, error: 'Speciality not found' })
      return
    }

    res.json({ success: true, data: speciality })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─── GET (public, by slug) ────────────────────────────────────────
export async function getBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params

    const speciality = await prisma.speciality.findUnique({ where: { slug } })
    if (!speciality) {
      res.status(404).json({ success: false, error: 'Speciality not found' })
      return
    }

    res.json({ success: true, data: speciality })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { title, slug, description, content, image } = req.body

    const existing = await prisma.speciality.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Speciality not found' })
      return
    }

    // Re-generate slug if title changed and slug not provided
    let finalSlug = existing.slug
    if (title && title !== existing.title && !slug) {
      const baseSlug = slugify(title)
      finalSlug = baseSlug
      let counter = 1
      while (true) {
        const conflict = await prisma.speciality.findUnique({ where: { slug: finalSlug } })
        if (!conflict || conflict.id === id) break
        finalSlug = `${baseSlug}-${counter++}`
      }
    } else if (slug && slug !== existing.slug) {
      const conflict = await prisma.speciality.findUnique({ where: { slug } })
      if (conflict && conflict.id !== id) {
        res.status(400).json({ success: false, error: 'Slug must be unique' })
        return
      }
      finalSlug = slug
    }

    const updated = await prisma.speciality.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(finalSlug !== existing.slug && { slug: finalSlug }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(image !== undefined && { image }),
      },
    })

    await logActivity('UPDATE', 'Speciality', `Updated speciality: ${updated.title}`, id)

    res.json({ success: true, data: updated })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const existing = await prisma.speciality.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Speciality not found' })
      return
    }

    await prisma.speciality.delete({ where: { id } })
    await logActivity('DELETE', 'Speciality', `Deleted speciality: ${existing.title}`, id)

    res.json({ success: true, data: { message: 'Speciality deleted' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Helpers ───────────────────────────────────────────────────────────
function emptyDoc() {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}
