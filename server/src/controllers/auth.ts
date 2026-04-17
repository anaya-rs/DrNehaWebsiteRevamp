import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const COOKIE_NAME = 'token'
const COOKIE_MAX_AGE = 8 * 60 * 60 * 1000 // 8 hours in ms

function setCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' })
      return
    }

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      res.status(401).json({ success: false, error: 'Invalid credentials' })
      return
    }

    const passwordValid = await bcrypt.compare(password, admin.passwordHash)
    if (!passwordValid) {
      res.status(401).json({ success: false, error: 'Invalid credentials' })
      return
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ success: false, error: 'JWT secret not configured' })
      return
    }

    const payload = { id: admin.id, email: admin.email, name: admin.name }
    const token = jwt.sign(payload, secret, { expiresIn: '8h' })

    setCookie(res, token)

    res.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        firstLogin: admin.firstLogin,
      },
    })
  } catch (err: any) {
    console.error('[Auth] Login error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    })
    res.json({ success: true, data: { message: 'Logged out successfully' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: { id: true, email: true, name: true, firstLogin: true, createdAt: true },
    })

    if (!admin) {
      res.status(404).json({ success: false, error: 'Admin not found' })
      return
    }

    res.json({ success: true, data: admin })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: 'Not authenticated' })
      return
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Current password and new password are required' })
      return
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, error: 'New password must be at least 8 characters' })
      return
    }

    const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } })
    if (!admin) {
      res.status(404).json({ success: false, error: 'Admin not found' })
      return
    }

    const passwordValid = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!passwordValid) {
      res.status(401).json({ success: false, error: 'Current password is incorrect' })
      return
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { passwordHash: newHash, firstLogin: false },
    })

    res.json({ success: true, data: { message: 'Password changed successfully' } })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
}
