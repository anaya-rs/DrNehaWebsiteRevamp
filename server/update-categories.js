const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCategories() {
  try {
    // Update all Uncategorized images to 'Gallery Photos' for frontend compatibility
    const result = await prisma.media.updateMany({
      where: {
        type: 'image',
        category: 'Uncategorized'
      },
      data: {
        category: 'Gallery Photos'
      }
    });
    
    console.log('Updated', result.count, 'images to Gallery Photos category');
    
    // Update video categories
    const videoResult = await prisma.media.updateMany({
      where: {
        type: 'video',
        category: 'Uncategorized'
      },
      data: {
        category: 'Videos'
      }
    });
    
    console.log('Updated', videoResult.count, 'videos to Videos category');
    
    // Update news clippings
    const newsResult = await prisma.media.updateMany({
      where: {
        category: { contains: 'News' }
      },
      data: {
        category: 'News Clippings'
      }
    });
    
    console.log('Updated', newsResult.count, 'items to News Clippings category');
    
    console.log('Category updates completed successfully');
  } catch (error) {
    console.error('Error updating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategories();
