const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// File categorization
const categories = {
  // Gallery images - mostly clinic photos and patient testimonials
  'IMG-20190919-WA0056.jpg': 'Clinic Photos',
  'IMG-20191101-WA0009.jpg': 'Clinic Photos', 
  'IMG-20191123-WA0034.jpg': 'Patient Testimonials',
  'IMG-20191123-WA0056.jpg': 'Patient Testimonials',
  'IMG-20191123-WA0069.jpg': 'Patient Testimonials',
  'IMG-20191123-WA0090.jpg': 'Patient Testimonials',
  'IMG-20191215-WA0037.jpg': 'Patient Testimonials',
  'IMG-20191215-WA0046.jpg': 'Patient Testimonials',
  'IMG-20200103-WA0030.jpg': 'Clinic Photos',
  'IMG-20200112-WA0009.jpg': 'Clinic Photos',
  'IMG-20200112-WA0015.jpg': 'Patient Testimonials',
  'IMG-20200112-WA0023.jpg': 'Patient Testimonials',
  'IMG-20200112-WA0122.jpg': 'Patient Testimonials',
  'IMG-20200123-WA0010.jpg': 'Patient Testimonials',
  'IMG-20200123-WA0033.jpg': 'Patient Testimonials',
  'IMG-20200201-WA0019.jpg': 'Clinic Photos',
  'IMG-20200201-WA0022.jpg': 'Clinic Photos',
  'IMG_20190919_142643.jpg': 'Clinic Photos',
  'IMG_20210206_105101.jpg': 'Clinic Photos',
  '76c637d4-c422-4249-93af-4a145aab025d.jpg': 'Clinic Photos',
  
  // 2026 April photos - mix of clinic and procedure results
  'IMG-20260405-WA0000.jpg': 'Procedure Results',
  'IMG-20260405-WA0001.jpg': 'Procedure Results',
  'IMG-20260405-WA0002.jpg': 'Procedure Results',
  'IMG-20260405-WA0003.jpg': 'Procedure Results',
  'IMG-20260405-WA0004.jpg': 'Procedure Results',
  'IMG-20260405-WA0005.jpg': 'Clinic Photos',
  'IMG-20260405-WA0006.jpg': 'Clinic Photos',
  'IMG-20260405-WA0007.jpg': 'Clinic Photos',
  'IMG-20260405-WA0008.jpg': 'Clinic Photos',
  'IMG-20260405-WA0009.jpg': 'Clinic Photos',
  'IMG-20260405-WA0010.jpg': 'Clinic Photos',
  'IMG-20260405-WA0011.jpg': 'Clinic Photos',
  'IMG-20260405-WA0012.jpg': 'Clinic Photos',
  'IMG-20260405-WA0013.jpg': 'Clinic Photos',
  'IMG-20260405-WA0014.jpg': 'Procedure Results',
  'IMG-20260405-WA0015.jpg': 'Procedure Results',
  'IMG-20260405-WA0016.jpg': 'Procedure Results',
  'IMG-20260405-WA0017.jpg': 'Procedure Results',
  'IMG-20260405-WA0018.jpg': 'Procedure Results',
  'IMG-20260405-WA0019.jpg': 'Clinic Photos',
  'IMG-20260405-WA0020.jpg': 'Clinic Photos',
  'IMG-20260405-WA0021.jpg': 'Procedure Results',
  'IMG-20260405-WA0022.jpg': 'Clinic Photos',
  'IMG-20260405-WA0023.jpg': 'Procedure Results',
  'IMG-20260405-WA0024.jpg': 'Clinic Photos',
  'IMG-20260405-WA0025.jpg': 'Clinic Photos',
  'IMG-20260405-WA0026.jpg': 'Procedure Results',
  'IMG-20260405-WA0027.jpg': 'Clinic Photos',
  'IMG-20260405-WA0028.jpg': 'Procedure Results',
  'IMG-20260405-WA0029.jpg': 'Clinic Photos',
  'IMG-20260405-WA0030.jpg': 'Procedure Results',
  'IMG-20260405-WA0031.jpg': 'Clinic Photos',
  'IMG-20260405-WA0032.jpg': 'Clinic Photos',
  'IMG-20260405-WA0033.jpg': 'Clinic Photos',
  'IMG-20260405-WA0034.jpg': 'Clinic Photos',
  'IMG-20260405-WA0035.jpg': 'Clinic Photos',
  'IMG-20260405-WA0036.jpg': 'Procedure Results',
  'IMG-20260405-WA0037.jpg': 'Procedure Results',
  'IMG-20260405-WA0038.jpg': 'Clinic Photos',
  'IMG-20260405-WA0039.jpg': 'Procedure Results',
  'IMG-20260405-WA0040.jpg': 'Clinic Photos',
  'IMG-20260405-WA0041.jpg': 'News Clippings',
  'IMG-20260405-WA0042.jpg': 'Clinic Photos',
  'IMG-20260405-WA0043.jpg': 'News Clippings',
  'IMG-20260405-WA0044.jpg': 'News Clippings',
  'IMG-20260405-WA0045.jpg': 'News Clippings',
  'IMG-20260405-WA0046.jpg': 'Clinic Photos',
  
  // News clippings
  'Screenshot 2022-09-14 at 3.13.24 PM.png': 'News Clippings',
  'Screenshot 2022-12-25 at 1.12.51 PM.png': 'News Clippings',
  'Screenshot 2023-04-09 at 4.26.57 PM.png': 'News Clippings',
  'Screenshot 2023-04-15 at 9.30.15 AM.png': 'News Clippings',
  
  // Videos
  '1.mov.mp4': 'Videos',
  'Dr. Neha Sood (Mirbek).mp4': 'Videos',
  'Ridhi testimonial final.mp4': 'Patient Testimonials',
  'VID-20260405-WA0047.mp4': 'Videos',
  'VID-20260405-WA0048.mp4': 'Videos',
  'VID-20260405-WA0049.mp4': 'Videos',
  'VID-20260405-WA0050.mp4': 'Videos',
  'VID-20260405-WA0051.mp4': 'Videos',
  'VID-20260405-WA0052.mp4': 'Videos',
  'VID-20260405-WA0053.mp4': 'Videos',
  'VID-20260405-WA0054.mp4': 'Videos',
  'ear piercing final copy.mp4': 'Procedure Results',
  'final proheath.mov.mp4': 'Videos',
  'prohealthspecialitisclinicintro.mov.mp4': 'Videos',
  'reel1.mp4': 'Videos'
};

async function seedMedia() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads', 'originals');
    const files = fs.readdirSync(uploadsDir);
    
    console.log('Found files:', files.length);
    
    for (const filename of files) {
      // Skip directories and existing placeholder files
      if (fs.statSync(path.join(uploadsDir, filename)).isDirectory() || 
          filename === 'gallery-photo-001.jpg') {
        continue;
      }
      
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      // Determine file type and category
      const isVideo = filename.endsWith('.mp4') || filename.endsWith('.mov');
      const isImage = filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png');
      
      if (!isVideo && !isImage) {
        console.log(`Skipping non-media file: ${filename}`);
        continue;
      }
      
      const category = categories[filename] || 'Uncategorized';
      const type = isVideo ? 'video' : 'image';
      
      // Check if already exists
      const existing = await prisma.media.findFirst({
        where: { filename }
      });
      
      if (existing) {
        console.log(`Skipping existing file: ${filename}`);
        continue;
      }
      
      // Create database entry
      const media = await prisma.media.create({
        data: {
          filename,
          originalUrl: `/uploads/originals/${filename}`,
          thumbnailUrl: `/uploads/originals/${filename}`, // For now, same as original
          altText: '',
          category,
          type,
          size: stats.size,
          width: null,
          height: null,
          isFeatured: false
        }
      });
      
      console.log(`Created: ${filename} -> ${category} (${type})`);
    }
    
    console.log('Media seeding completed!');
  } catch (error) {
    console.error('Error seeding media:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedMedia();
