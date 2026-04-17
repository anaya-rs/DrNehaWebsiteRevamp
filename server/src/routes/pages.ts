import { Router } from 'express'
import { get, update } from '../controllers/pages'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/:section', authenticate, get)
router.put('/:section', authenticate, update)

export default router
