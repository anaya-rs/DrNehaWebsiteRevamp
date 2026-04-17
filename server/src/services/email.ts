import nodemailer from 'nodemailer'

interface Appointment {
  id: string
  patientName: string
  phone: string
  gender?: string | null
  clinicLocation: string
  preferredTime: string
  status: string
  notes: string
  createdAt: Date
}

interface EmailTemplate {
  subject: string
  body: string
  enabled: boolean
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => vars[key] ?? '')
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Dr. Neha Sood Clinic" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[Email] Sent to ${to}: ${subject}`)
  } catch (err) {
    console.error('[Email] Failed to send email:', err)
  }
}

export async function sendAppointmentConfirmation(
  appointment: Appointment,
  template: EmailTemplate
): Promise<void> {
  if (!template.enabled) return

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  if (!adminEmail) {
    console.warn('[Email] No admin email configured for appointment confirmation')
    return
  }

  const vars: Record<string, string> = {
    patientName: appointment.patientName,
    phone: appointment.phone,
    gender: appointment.gender || 'N/A',
    clinicLocation: appointment.clinicLocation,
    preferredTime: appointment.preferredTime,
    status: appointment.status,
    notes: appointment.notes,
    appointmentId: appointment.id,
    createdAt: new Date(appointment.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  }

  const subject = renderTemplate(template.subject, vars)
  const html = renderTemplate(template.body, vars)

  await sendEmail(adminEmail, subject, html)
}

export async function sendAppointmentCancellation(
  appointment: Appointment,
  template: EmailTemplate
): Promise<void> {
  if (!template.enabled) return

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
  if (!adminEmail) {
    console.warn('[Email] No admin email configured for appointment cancellation')
    return
  }

  const vars: Record<string, string> = {
    patientName: appointment.patientName,
    phone: appointment.phone,
    gender: appointment.gender || 'N/A',
    clinicLocation: appointment.clinicLocation,
    preferredTime: appointment.preferredTime,
    status: appointment.status,
    notes: appointment.notes,
    appointmentId: appointment.id,
    createdAt: new Date(appointment.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  }

  const subject = renderTemplate(template.subject, vars)
  const html = renderTemplate(template.body, vars)

  await sendEmail(adminEmail, subject, html)
}
