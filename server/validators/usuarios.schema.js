import { z } from 'zod'

const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(72, 'Máximo 72 caracteres')
  .regex(/[a-z]/, 'Debe incluir una minúscula')
  .regex(/[A-Z]/, 'Debe incluir una mayúscula')
  .regex(/\d/, 'Debe incluir un número')

export const createUserSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Email no válido'),
    password,
    nombre: z.string().trim().min(2, 'Nombre demasiado corto').max(100),
    rol: z.enum(['admin', 'medico', 'administrativo']),
    medico: z
      .object({
        apellidos: z.string().trim().min(2, 'Apellidos requeridos'),
        numColegiado: z.string().trim().min(3, 'Nº de colegiado requerido'),
        especialidad: z.string().trim().optional(),
      })
      .optional(),
  })
  .refine((d) => d.rol !== 'medico' || d.medico, {
    message: 'Los datos del médico son obligatorios',
    path: ['medico'],
  })

export const updateUserSchema = z
  .object({
    rol: z.enum(['admin', 'administrativo']).optional(),
    activo: z.boolean().optional(),
  })
  .refine((d) => d.rol !== undefined || d.activo !== undefined, {
    message: 'No hay nada que actualizar',
  })

export const resetPasswordSchema = z.object({ newPassword: password })
