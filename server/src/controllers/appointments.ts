import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logActivity } from '../utils/activityLog'
import {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} from '../services/email'

const prisma = new PrismaClient()

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      clinic,
      date,
      search,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (status) where.status = status
    if (clinic) where.clinicLocation = { contains: clinic, mode: 'insensitive' }
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      where.createdAt = { gte: start, lte: end }
    }
    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ])

    res.json({
      success: true,
      data: appointments,
      meta: { total, page: pageNum, limit: limitNum },
    })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function patch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found' })
      return
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    })

    await logActivity('UPDATE', 'Appointment', `Updated appointment for ${updated.patientName} — status: ${updated.status}`, id)

    // Send email notifications
    if (status && status !== existing.status) {
      try {
        if (status === 'confirmed') {
          const template = await prisma.emailTemplate.findUnique({ where: { type: 'confirmation' } })
          if (template) await sendAppointmentConfirmation(updated, template)
        } else if (status === 'cancelled') {
          const template = await prisma.emailTemplate.findUnique({ where: { type: 'cancellation' } })
          if (template) await sendAppointmentCancellation(updated, template)
        }
      } catch (emailErr) {
        console.error('[Appointments] Email error (non-critical):', emailErr)
      }
    }

    res.json({ success: true, data: updated })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const existing = await prisma.appointment.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found' })
      return
    }

    await prisma.appointment.delete({ where: { id } })
    await logActivity('DELETE', 'Appointment', `Deleted appointment for ${existing.patientName}`, id)

    res.json({ success: true, data: { message: 'Appointment deleted' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const headers = ['Name', 'Phone', 'Gender', 'Clinic', 'Time', 'Status', 'Submitted']
    const rows = appointments.map((a) => [
      `"${a.patientName}"`,
      `"${a.phone}"`,
      `"${a.gender || ''}"`,
      `"${a.clinicLocation}"`,
      `"${a.preferredTime}"`,
      `"${a.status}"`,
      `"${new Date(a.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`,
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="appointments.csv"')
    res.send(csv)
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { patientName, phone, gender, clinicLocation, preferredTime, notes } = req.body

    if (!patientName || !phone || !clinicLocation || !preferredTime) {
      res.status(400).json({
        success: false,
        error: 'patientName, phone, clinicLocation, and preferredTime are required',
      })
      return
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        phone,
        gender: gender || null,
        clinicLocation,
        preferredTime,
        notes: notes || '',
        status: 'pending',
      },
    })

    await logActivity('CREATE', 'Appointment', `New appointment from ${patientName} (${phone})`, appointment.id)

    // Send confirmation email
    try {
      const template = await prisma.emailTemplate.findUnique({ where: { type: 'confirmation' } })
      if (template) await sendAppointmentConfirmation(appointment, template)
    } catch (emailErr) {
      console.error('[Appointments] Email error (non-critical):', emailErr)
    }

    res.status(201).json({ success: true, data: appointment })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
