import { Router } from 'express'
import { asyncHandler as h } from '../utils/asyncHandler.js'
import { validate } from '../middlewares/validate.js'
import * as c from '../controllers/usuarios.controller.js'
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from '../validators/usuarios.schema.js'

const router = Router()

router.get('/', h(c.list))
router.post('/', validate(createUserSchema), h(c.create))
router.patch('/:id', validate(updateUserSchema), h(c.update))
router.post('/:id/password', validate(resetPasswordSchema), h(c.resetPassword))

export default router
