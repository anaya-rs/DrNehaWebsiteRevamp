import 'dotenv/config'
import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import authRoutes from './routes/auth'
import appointmentRoutes from './routes/appointments'
import mediaRoutes from './routes/media'
import postRoutes from './routes/posts'
import pageRoutes from './routes/pages'
import settingsRoutes from './routes/settings'
import galleryRoutes from './routes/gallery'
import availabilityRoutes from './routes/availability'
import publicRoutes from './routes/public'

const app = express()
const PORT = process.env.PORT || 4000
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads')

// Ensure upload directories exist
const dirs = [
  path.join(UPLOAD_DIR, 'originals'),
  path.join(UPLOAD_DIR, 'thumbnails'),
]
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/public', publicRoutes)

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err)
  res.status(500).json({ success: false, error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
