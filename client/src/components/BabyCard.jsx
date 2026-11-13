import { useState } from 'react'
import { SEXO } from '../constants/labels'
import BabyForm from './BabyForm'
import { Badge, Button, Card, FileDown, Pencil, Trash2 } from './ui'

export default function BabyCard({ birth, baby, index, canDelete, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [pdfError, setPdfError] = useState('')

  const downloadCertificate = async () => {
    setPdfError('')
    setGenerating(true)
    try {
      // Carga diferida: jsPDF solo se descarga al pedir el primer certificado
      const { generateCertificate } = await import('../utils/certificate.js')
      generateCertificate(birth, baby, index)
    } catch {
      setPdfError('No se pudo generar el certificado')
    } finally {
      setGenerating(false)
    }
  }

  if (editing) {
    return (
      <Card title={`Editar recién nacido ${index + 1}`}>
        <BabyForm
          initial={baby}
          submitLabel="Guardar"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            const ok = await onUpdate(data)
            if (ok) setEditing(false)
          }}
        />
      </Card>
    )
  }

  const vivo = baby.estado === 'vivo'

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-800">
          {index + 1}
        </span>
        <div>
          <p className="font-medium text-ink">
            {baby.nombre || 'Sin nombre'}
            <span className="font-normal text-ink-muted"> · {SEXO[baby.sexo]}</span>
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Peso {baby.pesoG} g · Talla {baby.tallaCm ?? '—'} cm · Apgar {baby.apgar1 ?? '—'} /{' '}
            {baby.apgar5 ?? '—'}
          </p>
          {pdfError && <p className="mt-1 text-sm text-danger-700">{pdfError}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={vivo ? 'success' : 'neutral'}>{vivo ? 'Vivo' : 'Fallecido'}</Badge>
        {vivo && (
          <Button variant="secondary" size="sm" icon={FileDown} loading={generating} onClick={downloadCertificate}>
            Certificado
          </Button>
        )}
        <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
          Editar
        </Button>
        {canDelete && (
          <Button variant="dangerGhost" size="sm" icon={Trash2} onClick={onDelete}>
            Eliminar
          </Button>
        )}
      </div>
    </div>
  )
}
