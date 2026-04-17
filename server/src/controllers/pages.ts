import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()

export async function get(req: Request, res: Response): Promise<void> {
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

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params
    const { content } = req.body

    if (content === undefined) {
      res.status(400).json({ success: false, error: 'content is required' })
      return
    }

    const pageSection = await prisma.pageSection.upsert({
      where: { section },
      update: { content },
      create: { section, content },
    })

    await logActivity('UPDATE', 'PageSection', `Updated page section: ${section}`, pageSection.id)

    res.json({ success: true, data: pageSection })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
