import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logActivity } from '../utils/activityLog'
import { sendEmail } from '../services/email'
import { sendSms, SMS_ENABLED } from '../services/sms'

const prisma = new PrismaClient()

export async function get(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params

    const settings = await prisma.siteSettings.findUnique({ where: { section } })
    if (!settings) {
      res.status(404).json({ success: false, error: `Settings section "${section}" not found` })
      return
    }

    res.json({ success: true, data: settings })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.params
    const { data } = req.body

    if (data === undefined) {
      res.status(400).json({ success: false, error: 'data is required' })
      return
    }

    const settings = await prisma.siteSettings.upsert({
      where: { section },
      update: { data },
      create: { section, data },
    })

    await logActivity('UPDATE', 'SiteSettings', `Updated settings section: ${section}`, settings.id)

    res.json({ success: true, data: settings })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function testEmail(req: Request, res: Response): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
    if (!adminEmail) {
      res.status(400).json({ success: false, error: 'No admin email configured (ADMIN_EMAIL or SMTP_USER)' })
      return
    }

    await sendEmail(
      adminEmail,
      'Test Email — Dr. Neha Sood CMS',
      `<p>This is a test email from the Dr. Neha Sood CMS system.</p><p>Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>`
    )

    res.json({ success: true, data: { message: `Test email sent to ${adminEmail}` } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function getSpecialities(req: Request, res: Response): Promise<void> {
  try {
    // Return default specialities or fetch from settings if available
    const defaultSpecialities = [
      'General Dermatology',
      'Cosmetic Dermatology', 
      'Medical Dermatology',
      'Surgical Dermatology',
      'Pediatric Dermatology',
      'Dermatopathology'
    ]

    // Try to get custom specialities from settings
    const settings = await prisma.siteSettings.findUnique({ where: { section: 'specialities' } })
    
    if (settings && settings.data && typeof settings.data === 'object' && 'specialities' in settings.data) {
      const data = settings.data as any
      if (Array.isArray(data.specialities)) {
        res.json({ success: true, data: data.specialities })
        return
      }
    }
    
    res.json({ success: true, data: defaultSpecialities })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function getFaqs(req: Request, res: Response): Promise<void> {
  try {
    // Try to get FAQs from settings
    const settings = await prisma.siteSettings.findUnique({ where: { section: 'faqs' } })
    
    if (settings && settings.data && typeof settings.data === 'object' && 'faqs' in settings.data) {
      const data = settings.data as any
      if (Array.isArray(data.faqs)) {
        res.json({ success: true, data: data.faqs })
        return
      }
    }
    
    // Return empty array if no FAQs are configured
    res.json({ success: true, data: [] })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function testSms(req: Request, res: Response): Promise<void> {
  try {
    if (!SMS_ENABLED) {
      res.status(400).json({ success: false, error: 'SMS service not configured' })
      return
    }

    const { to } = req.body
    const phone = to || process.env.ADMIN_PHONE
    if (!phone) {
      res.status(400).json({ success: false, error: 'Phone number required (body.to or ADMIN_PHONE env var)' })
      return
    }

    await sendSms(phone, 'Test SMS from Dr. Neha Sood CMS system.')

    res.json({ success: true, data: { message: `Test SMS sent to ${phone}` } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
