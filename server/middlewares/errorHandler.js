import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

export const notFound = (req, res, next) =>
  next(new AppError(404, 'NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`))

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos no válidos',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    })
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'JSON mal formado' },
    })
  }

  console.error(err) // el detalle real solo se registra en el servidor
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
  })
}
