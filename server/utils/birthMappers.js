export const toBebe = (b) => ({
  id: b.id,
  nombre: b.nombre,
  sexo: b.sexo,
  pesoG: b.peso_g,
  tallaCm: b.talla_cm,
  apgar1: b.apgar_1,
  apgar5: b.apgar_5,
  estado: b.estado,
})

export const toClient = (r) => ({
  id: r.id,
  fechaHora: r.fecha_hora,
  tipoParto: r.tipo_parto,
  lugar: r.lugar,
  madre: `${r.madre.nombre} ${r.madre.apellidos}`,
  medico: `${r.medico.nombre} ${r.medico.apellidos}`,
  recienNacidos: r.recien_nacido.map(toBebe),
})

export const toDetail = (r) => ({
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

// De campos de la API a columnas (solo los que vienen informados)
export const bebeToDb = (b) => {
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
