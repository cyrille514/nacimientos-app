import { z } from 'zod'

const email = z.string().trim().toLowerCase().email('Email no válido')

const password = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(72, 'Máximo 72 caracteres')
  .regex(/[a-z]/, 'Debe incluir una minúscula')
  .regex(/[A-Z]/, 'Debe incluir una mayúscula')
  .regex(/\d/, 'Debe incluir un número')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Contraseña requerida'),
})

export const registerSchema = z.object({
  email,
  password,
  nombre: z.string().trim().min(2, 'Nombre demasiado corto').max(100),
  rol: z.enum(['admin', 'medico', 'administrativo']),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken requerido'),
})

export const forgotSchema = z.object({ email })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: password,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'La nueva contraseña debe ser distinta',
    path: ['newPassword'],
  })
