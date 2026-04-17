import { Router } from 'express'
import { get, update, testEmail, testSms } from '../controllers/settings'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/test-email', authenticate, testEmail)
router.post('/test-sms', authenticate, testSms)
router.get('/:section', authenticate, get)
router.put('/:section', authenticate, update)

export default router
