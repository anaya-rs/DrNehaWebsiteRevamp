import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads')

interface ProcessedImage {
  originalUrl: string
  thumbnailUrl: string
  width: number
  height: number
}

export async function processImage(
  inputPath: string,
  filename: string
): Promise<ProcessedImage> {
  const originalsDir = path.join(UPLOAD_DIR, 'originals')
  const thumbnailsDir = path.join(UPLOAD_DIR, 'thumbnails')

  // Ensure directories exist
  if (!fs.existsSync(originalsDir)) fs.mkdirSync(originalsDir, { recursive: true })
  if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true })

  // Use a .jpg extension for processed files
  const baseName = path.parse(filename).name
  const processedFilename = `${baseName}.jpg`

  const originalOutputPath = path.join(originalsDir, processedFilename)
  const thumbnailOutputPath = path.join(thumbnailsDir, processedFilename)

  // Process original: max 1920px wide, JPEG quality 80
  const originalInfo = await sharp(inputPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(originalOutputPath)

  // Process thumbnail: 400px wide, JPEG quality 80
  await sharp(inputPath)
    .resize({ width: 400, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbnailOutputPath)

  // Remove the raw upload if it differs from the output path
  if (inputPath !== originalOutputPath && fs.existsSync(inputPath)) {
    try {
      fs.unlinkSync(inputPath)
    } catch (_e) {
      // Non-critical
    }
  }

  return {
    originalUrl: `/uploads/originals/${processedFilename}`,
    thumbnailUrl: `/uploads/thumbnails/${processedFilename}`,
    width: originalInfo.width || 0,
    height: originalInfo.height || 0,
  }
}
