import { Router } from 'express'
import { list, create, get, update, remove } from '../controllers/posts'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, list)
router.post('/', authenticate, create)
router.get('/:id', authenticate, get)
router.put('/:id', authenticate, update)
router.delete('/:id', authenticate, remove)

export default router
