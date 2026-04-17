import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function logActivity(
  action: string,
  entity: string,
  description: string,
  entityId?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: { action, entity, entityId, description },
    })
  } catch (err) {
    console.error('[ActivityLog] Failed to log activity:', err)
  }
}
