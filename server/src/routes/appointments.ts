import { Router } from 'express'
import { list, patch, remove, exportCsv, create } from '../controllers/appointments'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public: form submission
router.post('/', create)

// Authenticated routes
router.get('/', authenticate, list)
router.get('/export.csv', authenticate, exportCsv)
router.patch('/:id', authenticate, patch)
router.delete('/:id', authenticate, remove)

export default router
