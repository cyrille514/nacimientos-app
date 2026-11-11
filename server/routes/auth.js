import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler as h } from '../utils/asyncHandler.js'
import { validate } from '../middlewares/validate.js'
import { authenticate, authorize } from '../middlewares/auth.js'
import * as c from '../controllers/auth.controller.js'
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  forgotSchema,
  changePasswordSchema,
} from '../validators/auth.schema.js'

const router = Router()

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos, espera 15 minutos' },
  },
})

router.post('/login', strictLimiter, validate(loginSchema), h(c.login))
router.post('/forgot-password', strictLimiter, validate(forgotSchema), h(c.forgotPassword))
router.post('/refresh', validate(refreshSchema), h(c.refresh))

router.get('/me', authenticate, h(c.me))
router.post('/logout', authenticate, h(c.logout))
router.patch('/password', authenticate, validate(changePasswordSchema), h(c.changePassword))

router.post('/register', authenticate, authorize('admin'), validate(registerSchema), h(c.register))

export default router
