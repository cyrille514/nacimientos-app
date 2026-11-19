export const ROLES = {
  admin: 'Administrador',
  medico: 'Médico',
  administrativo: 'Administrativo',
}

// Opciones de los <Select>, en el orden en que se muestran
export const ROLE_OPTIONS = {
  administrativo: ROLES.administrativo,
  medico: ROLES.medico,
  admin: ROLES.admin,
}

// Roles que se pueden asignar a una cuenta existente (un médico no cambia de rol)
export const ASSIGNABLE_ROLE_OPTIONS = {
  administrativo: ROLES.administrativo,
  admin: ROLES.admin,
}

export const PARTO = {
  vaginal: 'Vaginal',
  cesarea: 'Cesárea',
  instrumental: 'Instrumental',
}

export const SEXO = { F: 'Niña', M: 'Niño', I: 'Indeterminado' }

export const ESTADO_BEBE = { vivo: 'Vivo', fallecido: 'Fallecido' }

// Debe coincidir con MAX_BEBES del servidor (controllers/births.controller.js)
export const MAX_BABIES = 5
