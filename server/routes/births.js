import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../config/supabase.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler as h } from '../utils/asyncHandler.js'
import { validate } from '../middlewares/validate.js'
import { authorize } from '../middlewares/auth.js'

const router = Router()

const TIPOS = ['vaginal', 'cesarea', 'instrumental']
const MAX_BEBES = 5
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

const str = (v) => (typeof v === 'string' ? v : '')
const hoy = () => new Date().toISOString().slice(0, 10)

/* ---------- Transformadores ---------- */

const toBebe = (b) => ({
  id: b.id,
  nombre: b.nombre,
  sexo: b.sexo,
  pesoG: b.peso_g,
  tallaCm: b.talla_cm,
  apgar1: b.apgar_1,
  apgar5: b.apgar_5,
  estado: b.estado,
})

const toClient = (r) => ({
  id: r.id,
  fechaHora: r.fecha_hora,
  tipoParto: r.tipo_parto,
  lugar: r.lugar,
  madre: `${r.madre.nombre} ${r.madre.apellidos}`,
  medico: `${r.medico.nombre} ${r.medico.apellidos}`,
  recienNacidos: r.recien_nacido.map(toBebe),
})

const toDetail = (r) => ({
  id: r.id,
  fechaHora: r.fecha_hora,
  tipoParto: r.tipo_parto,
  lugar: r.lugar,
  semanasGestacion: r.semanas_gestacion,
  observaciones: r.observaciones,
  medicoId: r.medico_id,
  medico: `${r.medico.nombre} ${r.medico.apellidos}`,
  madre: {
    id: r.madre.id,
    nombre: r.madre.nombre,
    apellidos: r.madre.apellidos,
    documentoId: r.madre.documento_id,
    fechaNacimiento: r.madre.fecha_nacimiento,
    telefono: r.madre.telefono,
    direccion: r.madre.direccion,
  },
  recienNacidos: [...r.recien_nacido]
    .sort((a, b) => a.creado_en.localeCompare(b.creado_en))
    .map(toBebe),
})

const bebeToDb = (b) => {
  const out = {}
  if (b.nombre !== undefined) out.nombre = b.nombre || null
  if (b.sexo !== undefined) out.sexo = b.sexo
  if (b.pesoG !== undefined) out.peso_g = b.pesoG
  if (b.tallaCm !== undefined) out.talla_cm = b.tallaCm
  if (b.apgar1 !== undefined) out.apgar_1 = b.apgar1
  if (b.apgar5 !== undefined) out.apgar_5 = b.apgar5
  if (b.estado !== undefined) out.estado = b.estado
  return out
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

const checkId = (req, res, next) => {
  const { id, rnId } = req.params
  if (!UUID.test(id) || (rnId !== undefined && !UUID.test(rnId)))
    return next(new AppError(400, 'INVALID_ID', 'Identificador no válido'))
  next()
}

/* ---------- Esquemas de validación ---------- */

const bebeSchema = z.object({
  nombre: z.string().trim().max(100).nullable().optional(),
  sexo: z.enum(['F', 'M', 'I']),
  pesoG: z
    .number()
    .int('El peso debe ser un número entero')
    .min(300, 'Peso mínimo: 300 g')
    .max(7000, 'Peso máximo: 7000 g'),
  tallaCm: z
    .number()
    .min(20, 'Talla mínima: 20 cm')
    .max(70, 'Talla máxima: 70 cm')
    .nullable()
    .optional(),
  apgar1: z
    .number()
    .int('El Apgar debe ser un número entero')
    .min(0, 'Apgar mínimo: 0')
    .max(10, 'Apgar máximo: 10')
    .nullable()
    .optional(),
  apgar5: z
    .number()
    .int('El Apgar debe ser un número entero')
    .min(0, 'Apgar mínimo: 0')
    .max(10, 'Apgar máximo: 10')
    .nullable()
    .optional(),
  estado: z.enum(['vivo', 'fallecido']).optional(),
})

const bebeUpdateSchema = bebeSchema.partial()

const createSchema = z.object({
  madre: z.object({
    nombre: z.string().trim().min(1, 'Nombre de la madre requerido'),
    apellidos: z.string().trim().min(1, 'Apellidos requeridos'),
    documentoId: z.string().trim().min(3, 'Documento de identidad requerido'),
    fechaNacimiento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de nacimiento no válida')
      .refine((v) => v < hoy(), 'La fecha de nacimiento debe ser pasada'),
    telefono: z.string().trim().max(30, 'Teléfono demasiado largo').optional(),
    direccion: z.string().trim().max(200, 'Dirección demasiado larga').optional(),
  }),
  medicoId: z.string().min(1, 'Médico requerido'),
  fechaHora: z
    .string()
    .min(1, 'Fecha y hora requeridas')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha y hora no válidas'),
  tipoParto: z.enum(TIPOS),
  observaciones: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
  recienNacido: z.object({
    nombre: z.string().trim().optional(),
    sexo: z.enum(['F', 'M', 'I']),
    pesoG: z
      .number()
      .int('El peso debe ser un número entero')
      .min(300, 'Peso mínimo: 300 g')
      .max(7000, 'Peso máximo: 7000 g'),
  }),
})

const updateSchema = z.object({
  fechaHora: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha y hora no válidas')
    .optional(),
  medicoId: z.string().regex(UUID, 'Médico no válido').optional(),
  tipoParto: z.enum(TIPOS).optional(),
  lugar: z.string().trim().min(1, 'Lugar requerido').max(100).optional(),
  semanasGestacion: z
    .number()
    .int('Las semanas deben ser un número entero')
    .min(20, 'Mínimo 20 semanas')
    .max(45, 'Máximo 45 semanas')
    .nullable()
    .optional(),
  observaciones: z
    .string()
    .trim()
    .max(1000, 'Máximo 1000 caracteres')
    .nullable()
    .optional(),
  madre: z
    .object({
      nombre: z.string().trim().min(1, 'Nombre de la madre requerido').optional(),
      apellidos: z.string().trim().min(1, 'Apellidos requeridos').optional(),
      fechaNacimiento: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha de nacimiento no válida')
        .refine((v) => v < hoy(), 'La fecha de nacimiento debe ser pasada')
        .optional(),
      telefono: z.string().trim().max(30, 'Teléfono demasiado largo').nullable().optional(),
      direccion: z.string().trim().max(200, 'Dirección demasiado larga').nullable().optional(),
    })
    .optional(),
})

/* ---------- Listado con filtros ---------- */

router.get(
  '/',
  h(async (req, res) => {
    const q = str(req.query.q).trim().slice(0, 60)
    const medicoId = str(req.query.medicoId)
    const tipoParto = str(req.query.tipoParto)
    const desde = str(req.query.desde)
    const hasta = str(req.query.hasta)

    if (medicoId && !UUID.test(medicoId))
      throw new AppError(400, 'INVALID_FILTER', 'Médico no válido')
    if (tipoParto && !TIPOS.includes(tipoParto))
      throw new AppError(400, 'INVALID_FILTER', 'Tipo de parto no válido')
    if (desde && Number.isNaN(Date.parse(desde)))
      throw new AppError(400, 'INVALID_FILTER', 'Fecha "desde" no válida')
    if (hasta && Number.isNaN(Date.parse(hasta)))
      throw new AppError(400, 'INVALID_FILTER', 'Fecha "hasta" no válida')

    let query = supabase
      .from('nacimiento')
      .select(LIST_SELECT)
      .order('fecha_hora', { ascending: false })

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
  })
)

/* ---------- Crear nacimiento ---------- */

router.post(
  '/',
  validate(createSchema),
  h(async (req, res) => {
    const { madre, medicoId, fechaHora, tipoParto, observaciones, recienNacido } =
      req.body

    const { data: existente, error: madreErr } = await supabase
      .from('madre')
      .select('id')
      .eq('documento_id', madre.documentoId)
      .maybeSingle()
    if (madreErr) throw madreErr

    let madreId = existente?.id
    if (!madreId) {
      const { data, error } = await supabase
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
      if (error) throw error
      madreId = data.id
    } else if (madre.telefono || madre.direccion) {
      // Madre ya registrada: se actualizan solo los datos de contacto rellenados
      const contacto = {}
      if (madre.telefono) contacto.telefono = madre.telefono
      if (madre.direccion) contacto.direccion = madre.direccion
      const { error } = await supabase.from('madre').update(contacto).eq('id', madreId)
      if (error) throw error
    }

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
  })
)


/* ---------- Ficha detallada ---------- */

router.get(
  '/:id',
  checkId,
  h(async (req, res) => {
    res.json(await getDetail(req.params.id))
  })
)

router.patch(
  '/:id',
  checkId,
  validate(updateSchema),
  h(async (req, res) => {
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
  })
)

/* ---------- Recién nacidos (partos múltiples) ---------- */

router.post(
  '/:id/recien-nacidos',
  checkId,
  validate(bebeSchema),
  h(async (req, res) => {
    const { id } = req.params

    const { count, error: cErr } = await supabase
      .from('recien_nacido')
      .select('id', { count: 'exact', head: true })
      .eq('nacimiento_id', id)
    if (cErr) throw cErr
    if (count >= MAX_BEBES)
      throw new AppError(400, 'MAX_BEBES', `Máximo ${MAX_BEBES} recién nacidos por parto`)

    const { error } = await supabase
      .from('recien_nacido')
      .insert({ nacimiento_id: id, ...bebeToDb(req.body) })
    if (error) {
      if (error.code === '23503')
        throw new AppError(404, 'NOT_FOUND', 'Nacimiento no encontrado')
      throw error
    }

    res.status(201).json(await getDetail(id))
  })
)

router.patch(
  '/:id/recien-nacidos/:rnId',
  checkId,
  validate(bebeUpdateSchema),
  h(async (req, res) => {
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
    if (!data.length)
      throw new AppError(404, 'NOT_FOUND', 'Recién nacido no encontrado')

    res.json(await getDetail(id))
  })
)

router.delete(
  '/:id/recien-nacidos/:rnId',
  checkId,
  authorize('admin'),
  h(async (req, res) => {
    const { id, rnId } = req.params

    const { count, error: cErr } = await supabase
      .from('recien_nacido')
      .select('id', { count: 'exact', head: true })
      .eq('nacimiento_id', id)
    if (cErr) throw cErr
    if (count <= 1)
      throw new AppError(
        400,
        'LAST_BABY',
        'Un nacimiento debe tener al menos un recién nacido'
      )

    const { error } = await supabase
      .from('recien_nacido')
      .delete()
      .eq('id', rnId)
      .eq('nacimiento_id', id)
    if (error) throw error

    res.json(await getDetail(id))
  })
)

/* ---------- Eliminar nacimiento ---------- */

router.delete(
  '/:id',
  checkId,
  authorize('admin'),
  h(async (req, res) => {
    const { error } = await supabase
      .from('nacimiento')
      .delete()
      .eq('id', req.params.id)
    if (error) throw error
    res.status(204).end()
  })
)

export default router
