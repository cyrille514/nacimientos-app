import { Router } from 'express'
import { asyncHandler as h } from '../utils/asyncHandler.js'
import * as c from '../controllers/medicos.controller.js'

const router = Router()

router.get('/', h(c.list))

export default router
