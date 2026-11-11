import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token)
    throw new AppError(401, 'UNAUTHORIZED', 'Token requerido')

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user)
    throw new AppError(401, 'INVALID_TOKEN', 'Token inválido o expirado')
  
    if (data.user.banned_until && new Date(data.user.banned_until) > new Date())
    throw new AppError(403, 'USER_DISABLED', 'Cuenta desactivada')

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('perfil')
    .select('nombre, rol')
    .eq('id', data.user.id)
    .maybeSingle()

  if (perfilError) throw perfilError
  if (!perfil)
    throw new AppError(403, 'NO_PROFILE', 'Usuario sin perfil asignado')

  req.token = token
  req.user = {
    id: data.user.id,
    email: data.user.email,
    nombre: perfil.nombre,
    rol: perfil.rol,
  }
  next()
})

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol))
    return next(new AppError(403, 'FORBIDDEN', 'No tienes permisos para esta acción'))
  next()
}
