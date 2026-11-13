export const ROLES = {
  admin: 'Administrador',
  medico: 'Médico',
  administrativo: 'Administrativo',
}

export const PARTO = {
  vaginal: 'Vaginal',
  cesarea: 'Cesárea',
  instrumental: 'Instrumental',
}

export const SEXO = { F: 'Niña', M: 'Niño', I: 'Indeterminado' }

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('es-ES', { dateStyle: 'medium' })

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

