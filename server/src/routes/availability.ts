import { Router } from 'express'
import { get, update } from '../controllers/availability'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, get)
router.put('/', authenticate, update)

export default router
