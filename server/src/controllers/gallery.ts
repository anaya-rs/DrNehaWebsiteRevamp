import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()

const DEFAULT_GALLERY_SETTINGS = {
  layout: 'grid',
  columns: 3,
  showCaptions: true,
  showCategories: true,
  featuredOrder: [],
}

export async function getSettings(_req: Request, res: Response): Promise<void> {
  try {
    let settings = await prisma.gallerySettings.findFirst()

    if (!settings) {
      settings = await prisma.gallerySettings.create({
        data: DEFAULT_GALLERY_SETTINGS,
      })
    }

    res.json({ success: true, data: settings })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const { layout, columns, showCaptions, showCategories, featuredOrder } = req.body

    let settings = await prisma.gallerySettings.findFirst()

    if (settings) {
      settings = await prisma.gallerySettings.update({
        where: { id: settings.id },
        data: {
          ...(layout !== undefined && { layout }),
          ...(columns !== undefined && { columns: parseInt(columns, 10) }),
          ...(showCaptions !== undefined && { showCaptions: Boolean(showCaptions) }),
          ...(showCategories !== undefined && { showCategories: Boolean(showCategories) }),
          ...(featuredOrder !== undefined && { featuredOrder }),
        },
      })
    } else {
      settings = await prisma.gallerySettings.create({
        data: {
          layout: layout || DEFAULT_GALLERY_SETTINGS.layout,
          columns: columns ? parseInt(columns, 10) : DEFAULT_GALLERY_SETTINGS.columns,
          showCaptions: showCaptions !== undefined ? Boolean(showCaptions) : DEFAULT_GALLERY_SETTINGS.showCaptions,
          showCategories: showCategories !== undefined ? Boolean(showCategories) : DEFAULT_GALLERY_SETTINGS.showCategories,
          featuredOrder: featuredOrder || DEFAULT_GALLERY_SETTINGS.featuredOrder,
        },
      })
    }

    await logActivity('UPDATE', 'GallerySettings', 'Updated gallery settings', settings.id)

    res.json({ success: true, data: settings })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
