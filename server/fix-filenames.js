const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFilenames() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads', 'originals');
    const files = fs.readdirSync(uploadsDir);
    
    // Find files with spaces
    const filesWithSpaces = files.filter(f => f.includes(' ') && (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.webp')));
    
    console.log('Found files with spaces:', filesWithSpaces.length);
    
    for (const oldFilename of filesWithSpaces) {
      const newFilename = oldFilename.replace(/ /g, '_');
      const oldPath = path.join(uploadsDir, oldFilename);
      const newPath = path.join(uploadsDir, newFilename);
      
      // Rename physical file
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log('Renamed:', oldFilename, '->', newFilename);
        
        // Update database entry
        await prisma.media.updateMany({
          where: { filename: oldFilename },
          data: { 
            filename: newFilename,
            originalUrl: `/uploads/originals/${newFilename}`,
            thumbnailUrl: `/uploads/originals/${newFilename}`
          }
        });
        
        console.log('Updated database for:', newFilename);
      }
    }
    
    console.log('Filename fixes completed');
  } catch (error) {
    console.error('Error fixing filenames:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFilenames();
