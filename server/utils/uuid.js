import { AppError } from './AppError.js'

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Middleware: valida los identificadores de la ruta (:id y :rnId)
export const checkIdParams = (req, res, next) => {
  const { id, rnId } = req.params
  if (!UUID.test(id) || (rnId !== undefined && !UUID.test(rnId)))
    return next(new AppError(400, 'INVALID_ID', 'Identificador no válido'))
  next()
}
