// Estadísticas del Panel a partir de la lista de nacimientos
export function computeBirthStats(births) {
  const bebes = births.flatMap((b) => b.recienNacidos)
  const cesareas = births.filter((b) => b.tipoParto === 'cesarea').length

  return {
    partos: births.length,
    bebes: bebes.length,
    ninas: bebes.filter((r) => r.sexo === 'F').length,
    ninos: bebes.filter((r) => r.sexo === 'M').length,
    cesareas,
    pctCesareas: births.length ? Math.round((cesareas / births.length) * 100) : 0,
    pesoMedio: bebes.length
      ? Math.round(bebes.reduce((s, r) => s + r.pesoG, 0) / bebes.length)
      : 0,
  }
}
