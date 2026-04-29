import { Router } from 'express'
import { list, create, get, update, remove } from '../controllers/specialities'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', list)
router.post('/', authenticate, create)
router.get('/:id', get)
router.put('/:id', authenticate, update)
router.delete('/:id', authenticate, remove)

export default router
