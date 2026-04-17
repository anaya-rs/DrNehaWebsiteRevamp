import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logActivity } from '../utils/activityLog'

const prisma = new PrismaClient()

export async function get(_req: Request, res: Response): Promise<void> {
  try {
    const blocks = await prisma.availabilityBlock.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })
    res.json({ success: true, data: blocks })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { blocks } = req.body

    if (!Array.isArray(blocks)) {
      res.status(400).json({ success: false, error: 'blocks must be an array' })
      return
    }

    // Replace all recurring blocks with the new set (keep one-off specific date blocks)
    await prisma.availabilityBlock.deleteMany({ where: { isRecurring: true } })

    const created = await Promise.all(
      blocks.map((block: any) =>
        prisma.availabilityBlock.create({
          data: {
            dayOfWeek: block.dayOfWeek ?? null,
            startTime: block.startTime,
            endTime: block.endTime,
            isRecurring: block.isRecurring !== false,
            specificDate: block.specificDate ? new Date(block.specificDate) : null,
            label: block.label || '',
          },
        })
      )
    )

    await logActivity('UPDATE', 'AvailabilityBlock', `Updated availability schedule (${created.length} blocks)`)

    res.json({ success: true, data: created })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
