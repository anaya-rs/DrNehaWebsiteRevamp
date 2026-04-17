const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyAllImages() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads', 'originals');
    const files = fs.readdirSync(uploadsDir);
    
    // Get all image files
    const imageFiles = files.filter(f => 
      f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.webp')
    );
    
    console.log('Found image files on disk:', imageFiles.length);
    
    // Get all image entries from database
    const dbImages = await prisma.media.findMany({
      where: { type: 'image' },
      select: { filename: true, category: true }
    });
    
    console.log('Found image entries in database:', dbImages.length);
    
    // Find files not in database
    const dbFilenames = dbImages.map(img => img.filename);
    const missingFromDb = imageFiles.filter(f => !dbFilenames.includes(f));
    
    if (missingFromDb.length > 0) {
      console.log('Files missing from database:', missingFromDb);
      
      // Add missing files
      for (const filename of missingFromDb) {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        
        await prisma.media.create({
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
      }
    } else {
      console.log('All image files are in database');
    }
    
    // Show category breakdown
    const categoryBreakdown = dbImages.reduce((acc, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Category breakdown:', categoryBreakdown);
    
  } catch (error) {
    console.error('Error verifying images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllImages();
