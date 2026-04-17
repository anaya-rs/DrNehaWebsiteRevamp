import { Router } from 'express'
import { list, upload as uploadController, patch, remove, getCategories, saveCategories } from '../controllers/media'
import { authenticate } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

router.get('/', authenticate, list)
router.get('/categories', authenticate, getCategories)
router.put('/categories', authenticate, saveCategories)
router.post('/upload', authenticate, upload, uploadController)
router.patch('/:id', authenticate, patch)
router.delete('/:id', authenticate, remove)

export default router
