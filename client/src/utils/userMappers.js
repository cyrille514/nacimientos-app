export const EMPTY_USER_FORM = {
  email: '',
  password: '',
  nombre: '',
  rol: 'administrativo',
  apellidos: '',
  numColegiado: '',
  especialidad: '',
}

export const buildCreateUserPayload = (form) => {
  const body = {
    email: form.email,
    password: form.password,
    nombre: form.nombre,
    rol: form.rol,
  }

  if (form.rol === 'medico') {
    body.medico = {
      apellidos: form.apellidos,
      numColegiado: form.numColegiado,
      especialidad: form.especialidad,
    }
  }

  return body
}
