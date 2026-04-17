import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AdminPayload {
  id: string
  email: string
  name: string
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' })
    return
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      res.status(500).json({ success: false, error: 'JWT secret not configured' })
      return
    }

    const decoded = jwt.verify(token, secret) as AdminPayload
    req.admin = decoded
    next()
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}
