import { Router } from 'express'
import { asyncHandler as h } from '../utils/asyncHandler.js'
import { checkIdParams } from '../utils/uuid.js'
import { validate } from '../middlewares/validate.js'
import { authorize } from '../middlewares/auth.js'
import * as c from '../controllers/births.controller.js'
import {
  bebeSchema,
  bebeUpdateSchema,
  createSchema,
  updateSchema,
} from '../validators/births.schema.js'

const router = Router()

router.get('/', h(c.list))
router.post('/', validate(createSchema), h(c.create))

router.get('/:id', checkIdParams, h(c.getOne))
router.patch('/:id', checkIdParams, validate(updateSchema), h(c.update))
router.delete('/:id', checkIdParams, authorize('admin'), h(c.remove))

router.post('/:id/recien-nacidos', checkIdParams, validate(bebeSchema), h(c.addBaby))
router.patch('/:id/recien-nacidos/:rnId', checkIdParams, validate(bebeUpdateSchema), h(c.updateBaby))
router.delete('/:id/recien-nacidos/:rnId', checkIdParams, authorize('admin'), h(c.removeBaby))

export default router

