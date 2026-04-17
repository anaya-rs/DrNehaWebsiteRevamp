import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10)

// Ensure originals directory exists
const originalsDir = path.join(UPLOAD_DIR, 'originals')
if (!fs.existsSync(originalsDir)) {
  fs.mkdirSync(originalsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, originalsDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const uniqueName = `${uuidv4()}${ext}`
    cb(null, uniqueName)
  },
})

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('File type not allowed. Accepted: jpg, jpeg, png, webp, gif, mp4, mov, avi'))
  }
}

const multerConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
}

export const upload = multer(multerConfig).fields([{ name: 'file', maxCount: 1 }])

export const uploadMultiple = multer(multerConfig).array('files', 20)
