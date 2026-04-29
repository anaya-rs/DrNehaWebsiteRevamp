import { Router } from 'express'
import { publicList, getBySlug } from '../controllers/specialities'

const router = Router()

// Public routes — no authentication required
router.get('/', publicList)
router.get('/:slug', getBySlug)

export default router
