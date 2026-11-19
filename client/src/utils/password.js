export const passwordRules = (password) => [
  { ok: password.length >= 8, label: 'Mínimo 8 caracteres' },
  { ok: /[a-z]/.test(password), label: 'Una minúscula' },
  { ok: /[A-Z]/.test(password), label: 'Una mayúscula' },
  { ok: /\d/.test(password), label: 'Un número' },
]

export const isStrongPassword = (password) => passwordRules(password).every((r) => r.ok)
