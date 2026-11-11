import { supabaseAdmin, createAnonClient } from '../config/supabase.js'
import { AppError } from '../utils/AppError.js'

const getPerfil = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select('id, nombre, rol')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

const formatSession = (s) => ({
  accessToken: s.access_token,
  refreshToken: s.refresh_token,
  expiresAt: s.expires_at,
})

export async function login(req, res) {
  const { email, password } = req.body
  const { data, error } = await createAnonClient().auth.signInWithPassword({
    email,
    password,
  })

  // Mensaje genérico: no revela si el email existe
  if (error || !data.session)
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas')

  const perfil = await getPerfil(data.user.id)
  if (!perfil)
    throw new AppError(403, 'NO_PROFILE', 'Usuario sin perfil asignado')

  res.json({
    user: { id: perfil.id, email: data.user.email, nombre: perfil.nombre, rol: perfil.rol },
    session: formatSession(data.session),
  })
}

export async function refresh(req, res) {
  const { data, error } = await createAnonClient().auth.refreshSession({
    refresh_token: req.body.refreshToken,
  })
  if (error || !data.session)
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Sesión expirada, inicia sesión de nuevo')

  res.json({ session: formatSession(data.session) })
}

export async function logout(req, res) {
  await supabaseAdmin.auth.admin.signOut(req.token) // cierre best-effort
  res.status(204).end()
}

export async function me(req, res) {
  res.json({ user: req.user })
}

export async function register(req, res) {
  const { email, password, nombre, rol } = req.body

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    if (error.code === 'email_exists' || /already/i.test(error.message))
      throw new AppError(409, 'EMAIL_EXISTS', 'El email ya está registrado')
    throw new AppError(400, 'REGISTER_FAILED', 'No se pudo crear el usuario')
  }

  const { error: perfilError } = await supabaseAdmin
    .from('perfil')
    .insert({ id: data.user.id, nombre, rol })

  if (perfilError) {
    // Rollback: no dejar usuarios huérfanos sin perfil
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    throw perfilError
  }

  res.status(201).json({ user: { id: data.user.id, email, nombre, rol } })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body

  const { error } = await createAnonClient().auth.signInWithPassword({
    email: req.user.email,
    password: currentPassword,
  })
  if (error)
    throw new AppError(401, 'WRONG_PASSWORD', 'La contraseña actual es incorrecta')

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    req.user.id,
    { password: newPassword }
  )
  if (updateError)
    throw new AppError(400, 'UPDATE_FAILED', 'No se pudo cambiar la contraseña')

  res.json({ message: 'Contraseña actualizada' })
}

export async function forgotPassword(req, res) {
  await createAnonClient().auth.resetPasswordForEmail(req.body.email, {
    redirectTo: `${process.env.CLIENT_URL}/reset-password`,
  })
  // Siempre la misma respuesta: evita enumerar usuarios
  res.json({ message: 'Si el email existe, recibirás instrucciones' })
}
