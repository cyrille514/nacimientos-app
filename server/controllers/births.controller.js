import { supabase } from '../config/supabase.js'
import { AppError } from '../utils/AppError.js'
import { UUID } from '../utils/uuid.js'
import { bebeToDb, toClient, toDetail } from '../utils/birthMappers.js'
import { TIPOS } from '../validators/births.schema.js'

// Debe coincidir con MAX_BABIES del cliente (constants/labels.js)
const MAX_BEBES = 5

const LIST_SELECT = `
  id, fecha_hora, tipo_parto, lugar,
  madre!inner(nombre, apellidos),
  medico(nombre, apellidos),
  recien_nacido(id, nombre, sexo, peso_g, talla_cm)
`

const DETAIL_SELECT = `
  id, fecha_hora, tipo_parto, lugar, semanas_gestacion, observaciones, medico_id,
  madre(id, nombre, apellidos, documento_id, fecha_nacimiento, telefono, direccion),
  medico(id, nombre, apellidos),
  recien_nacido(id, nombre, sexo, peso_g, talla_cm, apgar_1, apgar_5, estado, creado_en)
`

/* ---------- Auxiliares ---------- */

const str = (v) => (typeof v === 'string' ? v : '')
const invalidFilter = (message) => new AppError(400, 'INVALID_FILTER', message)

function parseListFilters(query) {
  const filters = {
    q: str(query.q).trim().slice(0, 60),
    medicoId: str(query.medicoId),
    tipoParto: str(query.tipoParto),
    desde: str(query.desde),
    hasta: str(query.hasta),
  }

  if (filters.medicoId && !UUID.test(filters.medicoId)) throw invalidFilter('Médico no válido')
  if (filters.tipoParto && !TIPOS.includes(filters.tipoParto))
    throw invalidFilter('Tipo de parto no válido')
  if (filters.desde && Number.isNaN(Date.parse(filters.desde)))
    throw invalidFilter('Fecha "desde" no válida')
  if (filters.hasta && Number.isNaN(Date.parse(filters.hasta)))
    throw invalidFilter('Fecha "hasta" no válida')

  return filters
}

async function getDetail(id) {
  const { data, error } = await supabase
    .from('nacimiento')
    .select(DETAIL_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new AppError(404, 'NOT_FOUND', 'Nacimiento no encontrado')
  return toDetail(data)
}

async function countBabies(nacimientoId) {
  const { count, error } = await supabase
    .from('recien_nacido')
    .select('id', { count: 'exact', head: true })
    .eq('nacimiento_id', nacimientoId)
  if (error) throw error
  return count
}

// La madre se reutiliza si el documento ya existe (y se actualiza su contacto)
async function findOrCreateMadre(madre) {
  const { data: existente, error } = await supabase
    .from('madre')
    .select('id')
    .eq('documento_id', madre.documentoId)
    .maybeSingle()
  if (error) throw error

  if (existente) {
    const contacto = {}
    if (madre.telefono) contacto.telefono = madre.telefono
    if (madre.direccion) contacto.direccion = madre.direccion

    if (Object.keys(contacto).length) {
      const { error: e } = await supabase.from('madre').update(contacto).eq('id', existente.id)
      if (e) throw e
    }
    return existente.id
  }

  const { data, error: e } = await supabase
    .from('madre')
    .insert({
      nombre: madre.nombre,
      apellidos: madre.apellidos,
      fecha_nacimiento: madre.fechaNacimiento,
      documento_id: madre.documentoId,
      telefono: madre.telefono || null,
      direccion: madre.direccion || null,
    })
    .select('id')
    .single()
  if (e) throw e
  return data.id
}

/* ---------- Nacimientos ---------- */

export async function list(req, res) {
  const { q, medicoId, tipoParto, desde, hasta } = parseListFilters(req.query)

  let query = supabase
    .from('nacimiento')
    .select(LIST_SELECT)
    .order('fecha_hora', { ascending: false })

  // Cada palabra debe aparecer en el nombre, apellidos o documento de la madre
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 5)
  for (const w of words) {
    query = query.ilike('madre.busqueda', `%${w.replace(/[%_\\]/g, '')}%`)
  }

  if (medicoId) query = query.eq('medico_id', medicoId)
  if (tipoParto) query = query.eq('tipo_parto', tipoParto)
  if (desde) query = query.gte('fecha_hora', desde)
  if (hasta) query = query.lte('fecha_hora', hasta)

  const { data, error } = await query
  if (error) throw error
  res.json(data.map(toClient))
}

export async function create(req, res) {
  const { madre, medicoId, fechaHora, tipoParto, observaciones, recienNacido } = req.body

  const madreId = await findOrCreateMadre(madre)

  const { data: nac, error: nacErr } = await supabase
    .from('nacimiento')
    .insert({
      madre_id: madreId,
      medico_id: medicoId,
      fecha_hora: fechaHora,
      tipo_parto: tipoParto,
      observaciones: observaciones || null,
      creado_por: req.user.id,
    })
    .select('id')
    .single()
  if (nacErr) {
    if (nacErr.code === '23503')
      throw new AppError(400, 'INVALID_MEDICO', 'El médico seleccionado no existe')
    throw nacErr
  }

  // Si falla el recién nacido, se deshace el nacimiento
  const { error: rnErr } = await supabase.from('recien_nacido').insert({
    nacimiento_id: nac.id,
    nombre: recienNacido.nombre || null,
    sexo: recienNacido.sexo,
    peso_g: recienNacido.pesoG,
  })
  if (rnErr) {
    await supabase.from('nacimiento').delete().eq('id', nac.id)
    throw rnErr
  }

  const { data: creado, error: getErr } = await supabase
    .from('nacimiento')
    .select(LIST_SELECT)
    .eq('id', nac.id)
    .single()
  if (getErr) throw getErr

  res.status(201).json(toClient(creado))
}

export async function getOne(req, res) {
  res.json(await getDetail(req.params.id))
}

export async function update(req, res) {
  const { id } = req.params
  const { madre, medicoId, fechaHora, tipoParto, lugar, semanasGestacion, observaciones } =
    req.body

  const { data: actual, error } = await supabase
    .from('nacimiento')
    .select('id, madre_id')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!actual) throw new AppError(404, 'NOT_FOUND', 'Nacimiento no encontrado')

  const cambios = {}
  if (medicoId !== undefined) cambios.medico_id = medicoId
  if (fechaHora !== undefined) cambios.fecha_hora = fechaHora
  if (tipoParto !== undefined) cambios.tipo_parto = tipoParto
  if (lugar !== undefined) cambios.lugar = lugar
  if (semanasGestacion !== undefined) cambios.semanas_gestacion = semanasGestacion
  if (observaciones !== undefined) cambios.observaciones = observaciones || null

  if (Object.keys(cambios).length) {
    const { error: e } = await supabase.from('nacimiento').update(cambios).eq('id', id)
    if (e) {
      if (e.code === '23503')
        throw new AppError(400, 'INVALID_MEDICO', 'El médico seleccionado no existe')
      throw e
    }
  }

  if (madre) {
    const m = {}
    if (madre.nombre !== undefined) m.nombre = madre.nombre
    if (madre.apellidos !== undefined) m.apellidos = madre.apellidos
    if (madre.fechaNacimiento !== undefined) m.fecha_nacimiento = madre.fechaNacimiento
    if (madre.telefono !== undefined) m.telefono = madre.telefono || null
    if (madre.direccion !== undefined) m.direccion = madre.direccion || null

    if (Object.keys(m).length) {
      const { error: e } = await supabase.from('madre').update(m).eq('id', actual.madre_id)
      if (e) throw e
    }
  }

  res.json(await getDetail(id))
}

export async function remove(req, res) {
  const { error } = await supabase.from('nacimiento').delete().eq('id', req.params.id)
  if (error) throw error
  res.status(204).end()
}

/* ---------- Recién nacidos (partos múltiples) ---------- */

export async function addBaby(req, res) {
  const { id } = req.params

  if ((await countBabies(id)) >= MAX_BEBES)
    throw new AppError(400, 'MAX_BEBES', `Máximo ${MAX_BEBES} recién nacidos por parto`)

  const { error } = await supabase
    .from('recien_nacido')
    .insert({ nacimiento_id: id, ...bebeToDb(req.body) })
  if (error) {
    if (error.code === '23503') throw new AppError(404, 'NOT_FOUND', 'Nacimiento no encontrado')
    throw error
  }

  res.status(201).json(await getDetail(id))
}

export async function updateBaby(req, res) {
  const { id, rnId } = req.params

  const cambios = bebeToDb(req.body)
  if (!Object.keys(cambios).length)
    throw new AppError(400, 'NO_CHANGES', 'No hay nada que actualizar')

  const { data, error } = await supabase
    .from('recien_nacido')
    .update(cambios)
    .eq('id', rnId)
    .eq('nacimiento_id', id)
    .select('id')
  if (error) throw error
  if (!data.length) throw new AppError(404, 'NOT_FOUND', 'Recién nacido no encontrado')

  res.json(await getDetail(id))
}

export async function removeBaby(req, res) {
  const { id, rnId } = req.params

  if ((await countBabies(id)) <= 1)
    throw new AppError(400, 'LAST_BABY', 'Un nacimiento debe tener al menos un recién nacido')

  const { error } = await supabase
    .from('recien_nacido')
    .delete()
    .eq('id', rnId)
    .eq('nacimiento_id', id)
  if (error) throw error

  res.json(await getDetail(id))
}
