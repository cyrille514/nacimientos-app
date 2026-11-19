import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../utils/AppError.js'
import { UUID } from '../utils/uuid.js'

const BAN = '876000h' // ~100 años: equivale a desactivar la cuenta

const checkId = (id) => {
  if (!UUID.test(id))
    throw new AppError(400, 'INVALID_ID', 'Identificador no válido')
}

const isActive = (u) =>
  !u.banned_until || new Date(u.banned_until) <= new Date()

export async function list(req, res) {
  const { data: perfiles, error } = await supabaseAdmin
    .from('perfil')
    .select('id, nombre, rol, creado_en')
    .order('creado_en', { ascending: true })
  if (error) throw error

  const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (authError) throw authError

  const byId = new Map(data.users.map((u) => [u.id, u]))

  res.json(
    perfiles.map((p) => {
      const u = byId.get(p.id)
      return {
        id: p.id,
        nombre: p.nombre,
        rol: p.rol,
        email: u?.email ?? null,
        activo: u ? isActive(u) : false,
        creadoEn: p.creado_en,
        ultimoAcceso: u?.last_sign_in_at ?? null,
      }
    })
  )
}

export async function create(req, res) {
  const { email, password, nombre, rol, medico } = req.body

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

  const userId = data.user.id

  // Si algo falla, se borra el usuario de Auth (perfil se borra en cascada)
  const rollback = () => supabaseAdmin.auth.admin.deleteUser(userId)

  const { error: perfilError } = await supabaseAdmin
    .from('perfil')
    .insert({ id: userId, nombre, rol })
  if (perfilError) {
    await rollback()
    throw perfilError
  }

  if (rol === 'medico') {
    const { error: medError } = await supabaseAdmin.from('medico').insert({
      perfil_id: userId,
      nombre,
      apellidos: medico.apellidos,
      especialidad: medico.especialidad || null,
      num_colegiado: medico.numColegiado,
    })
    if (medError) {
      await rollback()
      if (medError.code === '23505')
        throw new AppError(409, 'COLEGIADO_EXISTS', 'Ese nº de colegiado ya existe')
      throw medError
    }
  }

  res.status(201).json({ user: { id: userId, email, nombre, rol } })
}

export async function update(req, res) {
  const { id } = req.params
  checkId(id)
  const { rol, activo } = req.body

  if (id === req.user.id && ((rol && rol !== req.user.rol) || activo === false))
    throw new AppError(
      400,
      'SELF_CHANGE',
      'No puedes cambiar tu propio rol ni desactivar tu cuenta'
    )

  const { data: actual, error } = await supabaseAdmin
    .from('perfil')
    .select('id, rol')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!actual) throw new AppError(404, 'NOT_FOUND', 'Usuario no encontrado')

  if (rol && rol !== actual.rol && actual.rol === 'medico')
    throw new AppError(
      400,
      'ROLE_LOCKED',
      'No se puede cambiar el rol de un médico'
    )

  if (rol && rol !== actual.rol) {
    const { error: e } = await supabaseAdmin
      .from('perfil')
      .update({ rol })
      .eq('id', id)
    if (e) throw e
  }

  if (activo !== undefined) {
    const { error: e } = await supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: activo ? 'none' : BAN,
    })
    if (e)
      throw new AppError(400, 'UPDATE_FAILED', 'No se pudo actualizar el estado')

    // Un médico desactivado deja de aparecer en el formulario de nacimientos
    if (actual.rol === 'medico') {
      const { error: medError } = await supabaseAdmin
        .from('medico')
        .update({ activo })
        .eq('perfil_id', id)
      if (medError) throw medError
    }
  }

  res.json({ message: 'Usuario actualizado' })
}

export async function resetPassword(req, res) {
  const { id } = req.params
  checkId(id)

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    password: req.body.newPassword,
  })
  if (error)
    throw new AppError(400, 'UPDATE_FAILED', 'No se pudo cambiar la contraseña')

  res.json({ message: 'Contraseña actualizada' })
}
