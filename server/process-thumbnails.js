const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

async function processThumbnails() {
  try {
    const originalsDir = path.join(UPLOAD_DIR, 'originals');
    const thumbnailsDir = path.join(UPLOAD_DIR, 'thumbnails');
    
    // Ensure thumbnails directory exists
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    // Get all image files from database
    const mediaItems = await prisma.media.findMany({
      where: { type: 'image' }
    });
    
    console.log(`Found ${mediaItems.length} images to process`);
    
    for (const item of mediaItems) {
      const filename = item.filename;
      const inputPath = path.join(originalsDir, filename);
      
      // Skip if file doesn't exist
      if (!fs.existsSync(inputPath)) {
        console.log(`File not found: ${filename}`);
        continue;
      }
      
      // Use a .jpg extension for processed files
      const baseName = path.parse(filename).name;
      const processedFilename = `${baseName}.jpg`;
      
      const thumbnailOutputPath = path.join(thumbnailsDir, processedFilename);
      
      // Check if thumbnail already exists
      if (fs.existsSync(thumbnailOutputPath)) {
        console.log(`Thumbnail already exists: ${processedFilename}`);
        
        // Update database with correct thumbnail URL
        await prisma.media.update({
          where: { id: item.id },
          data: { 
            thumbnailUrl: `/uploads/thumbnails/${processedFilename}`,
            originalUrl: `/uploads/originals/${filename}` // Keep original URL
          }
        });
        
        continue;
      }
      
      try {
        // Get image dimensions
        const metadata = await sharp(inputPath).metadata();
        
        // Process thumbnail: 400px wide, JPEG quality 80
        await sharp(inputPath)
          .resize({ width: 400, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailOutputPath);
        
        // Update database with thumbnail URL and dimensions
        await prisma.media.update({
          where: { id: item.id },
          data: { 
            thumbnailUrl: `/uploads/thumbnails/${processedFilename}`,
            width: metadata.width,
            height: metadata.height
          }
        });
        
        console.log(`Processed thumbnail: ${filename} -> ${processedFilename}`);
      } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
      }
    }
    
    console.log('Thumbnail processing completed!');
  } catch (error) {
    console.error('Error processing thumbnails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processThumbnails();
