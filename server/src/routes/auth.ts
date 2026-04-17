import { Router } from 'express'
import { login, logout, me, changePassword } from '../controllers/auth'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticate, me)
router.patch('/change-password', authenticate, changePassword)

export default router
