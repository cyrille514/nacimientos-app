import { useState } from 'react'
import BabyForm from './BabyForm'

const SEXO = { F: 'Niña', M: 'Niño', I: 'Indeterminado' }

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
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-3">Editar recién nacido {index + 1}</h3>
        <BabyForm
          initial={baby}
          submitLabel="Guardar"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            const ok = await onUpdate(data)
            if (ok) setEditing(false)
          }}
        />
      </div>
    )
  }

  const vivo = baby.estado === 'vivo'

  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-medium">
          {index + 1}. {baby.nombre || 'Sin nombre'} · {SEXO[baby.sexo]}
        </p>
        <p className="text-sm text-gray-600">
          Peso: {baby.pesoG} g · Talla: {baby.tallaCm ?? '—'} cm · Apgar 1'/5':{' '}
          {baby.apgar1 ?? '—'} / {baby.apgar5 ?? '—'}
        </p>
        {pdfError && <p className="text-sm text-red-600 mt-1">{pdfError}</p>}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span
          className={`px-2 py-0.5 rounded text-xs ${vivo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}
        >
          {vivo ? 'Vivo' : 'Fallecido'}
        </span>
        {vivo && (
          <button
            onClick={downloadCertificate}
            disabled={generating}
            className="text-pink-600 hover:underline disabled:opacity-50"
          >
            {generating ? 'Generando...' : 'Certificado PDF'}
          </button>
        )}
        <button onClick={() => setEditing(true)} className="text-pink-600 hover:underline">
          Editar
        </button>
        {canDelete && (
          <button onClick={onDelete} className="text-red-600 hover:underline">
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}
