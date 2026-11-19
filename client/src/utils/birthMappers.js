import { endOfDayISO, fromLocalInput, startOfDayISO, toLocalInput } from './dates'

/* Filtros de la lista */

export const EMPTY_FILTERS = { q: '', desde: '', hasta: '', medicoId: '', tipoParto: '' }

export const filtersToApi = (f) => ({
  q: f.q.trim(),
  medicoId: f.medicoId,
  tipoParto: f.tipoParto,
  desde: f.desde ? startOfDayISO(f.desde) : '',
  hasta: f.hasta ? endOfDayISO(f.hasta) : '',
})

/* Alta de un nacimiento */

export const EMPTY_BIRTH_FORM = {
  nombre: '',
  apellidos: '',
  documentoId: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  medicoId: '',
  fechaHora: '',
  tipoParto: 'vaginal',
  observaciones: '',
  bebeNombre: '',
  sexo: 'F',
  pesoG: '',
}

export const buildCreateBirthPayload = (form) => ({
  madre: {
    nombre: form.nombre,
    apellidos: form.apellidos,
    documentoId: form.documentoId,
    fechaNacimiento: form.fechaNacimiento,
    telefono: form.telefono.trim(),
    direccion: form.direccion.trim(),
  },
  medicoId: form.medicoId,
  fechaHora: fromLocalInput(form.fechaHora),
  tipoParto: form.tipoParto,
  observaciones: form.observaciones.trim(),
  recienNacido: {
    nombre: form.bebeNombre,
    sexo: form.sexo,
    pesoG: Number(form.pesoG),
  },
})

/* Edición de la ficha */

export const birthToEditForm = (b) => ({
  fechaHora: toLocalInput(b.fechaHora),
  medicoId: b.medicoId,
  tipoParto: b.tipoParto,
  lugar: b.lugar ?? '',
  semanasGestacion: b.semanasGestacion ?? '',
  observaciones: b.observaciones ?? '',
  mNombre: b.madre.nombre,
  mApellidos: b.madre.apellidos,
  mFechaNac: b.madre.fechaNacimiento ?? '',
  mTelefono: b.madre.telefono ?? '',
  mDireccion: b.madre.direccion ?? '',
})

export const buildUpdateBirthPayload = (form) => ({
  fechaHora: fromLocalInput(form.fechaHora),
  medicoId: form.medicoId,
  tipoParto: form.tipoParto,
  lugar: form.lugar,
  semanasGestacion: form.semanasGestacion === '' ? null : Number(form.semanasGestacion),
  observaciones: form.observaciones.trim() || null,
  madre: {
    nombre: form.mNombre,
    apellidos: form.mApellidos,
    fechaNacimiento: form.mFechaNac,
    telefono: form.mTelefono.trim() || null,
    direccion: form.mDireccion.trim() || null,
  },
})
