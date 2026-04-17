import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/gallery'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/settings', authenticate, getSettings)
router.put('/settings', authenticate, updateSettings)

export default router
