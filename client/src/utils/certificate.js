import { jsPDF } from 'jspdf'

const SEXO = { F: 'Niña', M: 'Niño', I: 'Indeterminado' }
const PARTO = { vaginal: 'Vaginal', cesarea: 'Cesárea', instrumental: 'Instrumental' }

const PINK = [219, 39, 119]
const GRAY = [100, 100, 100]
const DARK = [30, 30, 30]

const fechaLarga = (d) =>
  new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function generateCertificate(birth, baby, index = 0) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 22
  const LABEL_W = 58
  let y = 30

  // Marco doble
  doc.setDrawColor(...PINK)
  doc.setLineWidth(0.8)
  doc.rect(10, 10, W - 20, 277)
  doc.setLineWidth(0.2)
  doc.rect(12, 12, W - 24, 273)

  // Cabecera
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text('GESTIÓN DE NACIMIENTOS', W / 2, y, { align: 'center' })

  y += 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...PINK)
  doc.text('CERTIFICADO DE NACIMIENTO', W / 2, y, { align: 'center' })

  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text(`Nº ${birth.id.slice(0, 8).toUpperCase()}-${index + 1}`, W / 2, y, {
    align: 'center',
  })

  y += 9
  doc.setDrawColor(...PINK)
  doc.setLineWidth(0.4)
  doc.line(M, y, W - M, y)
  y += 12

  const section = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...PINK)
    doc.text(title, M, y)
    y += 3
    doc.setDrawColor(225, 225, 225)
    doc.setLineWidth(0.2)
    doc.line(M, y, W - M, y)
    y += 7
  }

  const row = (label, value) => {
    const lines = doc.splitTextToSize(String(value ?? '—'), W - M * 2 - LABEL_W)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...GRAY)
    doc.text(label, M, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...DARK)
    doc.text(lines, M + LABEL_W, y)
    y += lines.length * 5.5 + 2.5
  }

  // Recién nacido
  section('Recién nacido')
  row('Nombre', baby.nombre || 'Sin nombre')
  row('Sexo', SEXO[baby.sexo])
  row(
    'Fecha y hora de nacimiento',
    new Date(birth.fechaHora).toLocaleString('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    })
  )
  row('Lugar', birth.lugar)
  row('Peso', `${baby.pesoG} g`)
  row('Talla', baby.tallaCm != null ? `${baby.tallaCm} cm` : '—')
  row('Apgar (1 min / 5 min)', `${baby.apgar1 ?? '—'} / ${baby.apgar5 ?? '—'}`)
  row('Tipo de parto', PARTO[birth.tipoParto])
  row(
    'Semanas de gestación',
    birth.semanasGestacion ? `${birth.semanasGestacion} semanas` : '—'
  )
  if (birth.recienNacidos.length > 1) {
    row('Parto múltiple', `Recién nacido ${index + 1} de ${birth.recienNacidos.length}`)
  }

  // Madre
  y += 4
  section('Madre')
  row('Nombre completo', `${birth.madre.nombre} ${birth.madre.apellidos}`)
  row('Documento de identidad', birth.madre.documentoId)
  row(
    'Fecha de nacimiento',
    birth.madre.fechaNacimiento
      ? fechaLarga(`${birth.madre.fechaNacimiento}T00:00:00`)
      : '—'
  )

  // Atención del parto
  y += 4
  section('Atención del parto')
  row('Médico responsable', birth.medico)

  // Firma
  const firmaY = 238
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY)
  doc.text(`Emitido el ${fechaLarga(new Date())}`, M, firmaY)

  doc.setDrawColor(60, 60, 60)
  doc.setLineWidth(0.3)
  doc.line(W - M - 70, firmaY, W - M, firmaY)
  doc.setFontSize(9)
  doc.text('Firma y sello del médico responsable', W - M - 35, firmaY + 5, {
    align: 'center',
  })
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text(birth.medico, W - M - 35, firmaY + 10, { align: 'center' })

  // Aviso
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text(
    doc.splitTextToSize(
      'Documento informativo del centro. No sustituye al certificado médico oficial ni a la inscripción en el Registro Civil.',
      W - M * 2
    ),
    W / 2,
    270,
    { align: 'center' }
  )

  const fecha = new Date(birth.fechaHora).toISOString().slice(0, 10)
  const nombre = slug(baby.nombre || '') || 'recien-nacido'
  doc.save(`certificado-${nombre}-${fecha}.pdf`)
}

