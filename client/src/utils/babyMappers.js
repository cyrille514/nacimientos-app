
const num = (v) => (v === '' || v === null ? null : Number(v))

export const EMPTY_BABY_FORM = {
  nombre: '',
  sexo: 'F',
  pesoG: '',
  tallaCm: '',
  apgar1: '',
  apgar5: '',
  estado: 'vivo',
}

export const babyToForm = (b) =>
  b
    ? {
        nombre: b.nombre ?? '',
        sexo: b.sexo ?? 'F',
        pesoG: b.pesoG ?? '',
        tallaCm: b.tallaCm ?? '',
        apgar1: b.apgar1 ?? '',
        apgar5: b.apgar5 ?? '',
        estado: b.estado ?? 'vivo',
      }
    : EMPTY_BABY_FORM

export const buildBabyPayload = (form) => ({
  nombre: form.nombre.trim(),
  sexo: form.sexo,
  pesoG: Number(form.pesoG),
  tallaCm: num(form.tallaCm),
  apgar1: num(form.apgar1),
  apgar5: num(form.apgar5),
  estado: form.estado,
})