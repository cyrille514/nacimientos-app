import { useState } from 'react'
import { SEXO } from '../constants/labels'
import BabyForm from './BabyForm'
import { Badge, Button, Card, FileDown, Pencil, Trash2 } from './ui'

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="text-sm font-medium tabular-nums text-ink">{value}</dd>
    </div>
  )
}

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
    <div className="min-w-0 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-ink-muted">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="break-words font-medium text-ink">{baby.nombre || 'Sin nombre'}</p>
            <Badge tone={vivo ? 'success' : 'neutral'} dot>
              {vivo ? 'Vivo' : 'Fallecido'}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">{SEXO[baby.sexo]}</p>

          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <Stat label="Peso" value={`${baby.pesoG} g`} />
            <Stat label="Talla" value={baby.tallaCm != null ? `${baby.tallaCm} cm` : '—'} />
            <Stat label="Apgar 1'" value={baby.apgar1 ?? '—'} />
            <Stat label="Apgar 5'" value={baby.apgar5 ?? '—'} />
          </dl>

          {pdfError && <p className="mt-2 text-sm text-danger-700">{pdfError}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {vivo && (
          <Button
            variant="secondary"
            size="sm"
            icon={FileDown}
            loading={generating}
            onClick={downloadCertificate}
            className="flex-1 sm:flex-none"
          >
            Certificado
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={Pencil}
          onClick={() => setEditing(true)}
          className="flex-1 sm:flex-none"
        >
          Editar
        </Button>
        {canDelete && (
          <Button
            variant="dangerGhost"
            size="sm"
            icon={Trash2}
            onClick={onDelete}
            className="flex-1 sm:flex-none"
          >
            Eliminar
          </Button>
        )}
      </div>
    </div>
  )
}
