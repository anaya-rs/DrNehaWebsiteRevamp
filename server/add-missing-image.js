const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addMissingImage() {
  try {
    const filename = 'gallery-photo-018.jpg';
    const uploadsDir = path.join(__dirname, 'uploads', 'originals');
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist:', filename);
      return;
    }
    
    const stats = fs.statSync(filePath);
    
    // Check if already in database
    const existing = await prisma.media.findFirst({
      where: { filename }
    });
    
    if (existing) {
      console.log('File already exists in database:', filename);
      return;
    }
    
    // Add to database
    const media = await prisma.media.create({
      data: {
        filename,
        originalUrl: `/uploads/originals/${filename}`,
        thumbnailUrl: `/uploads/originals/${filename}`,
        altText: '',
        category: 'Gallery Photos',
        type: 'image',
        size: stats.size,
        isFeatured: false
      }
    });
    
    console.log('Added to database:', filename);
  } catch (error) {
    console.error('Error adding missing image:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingImage();
