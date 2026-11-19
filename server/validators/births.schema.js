import { z } from 'zod'
import { UUID } from '../utils/uuid.js'

export const TIPOS = ['vaginal', 'cesarea', 'instrumental']

const hoy = () => new Date().toISOString().slice(0, 10)

export const bebeSchema = z.object({
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

export const bebeUpdateSchema = bebeSchema.partial()

export const createSchema = z.object({
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

export const updateSchema = z.object({
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
