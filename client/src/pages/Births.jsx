import { useState, useEffect } from 'react'
import useBirths from '../hooks/useBirths'
import { getMedicos } from '../services/birthService'
import BirthForm from '../components/BirthForm'
import BirthFilters from '../components/BirthFilters'
import BirthTable from '../components/BirthTable'
import ConfirmDialog from '../components/ConfirmDialog'
import { Alert, Card, PageHeader } from '../components/ui'
import { formatDate } from '../constants/labels'

const emptyFilters = { q: '', desde: '', hasta: '', medicoId: '', tipoParto: '' }

// Convierte las fechas del formulario a ISO, en hora local del navegador
const toApi = (f) => ({
  q: f.q.trim(),
  medicoId: f.medicoId,
  tipoParto: f.tipoParto,
  desde: f.desde ? new Date(`${f.desde}T00:00:00`).toISOString() : '',
  hasta: f.hasta ? new Date(`${f.hasta}T23:59:59.999`).toISOString() : '',
})

export default function Births() {
  const [medicos, setMedicos] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(toApi(emptyFilters))
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { births, loading, error, add, remove } = useBirths(applied)

  useEffect(() => {
    getMedicos()
      .then((d) => setMedicos(Array.isArray(d) ? d : []))
      .catch(() => setMedicos([]))
  }, [])

  // Espera 400 ms tras escribir antes de consultar al servidor
  useEffect(() => {
    const t = setTimeout(() => setApplied(toApi(filters)), 400)
    return () => clearTimeout(t)
  }, [filters])

  const hayFiltros = Object.values(filters).some(Boolean)

  const askDelete = (id) => setToDelete(births.find((b) => b.id === id) ?? null)

  const confirmDelete = async () => {
    setDeleting(true)
    await remove(toDelete.id)
    setDeleting(false)
    setToDelete(null)
  }

  return (
    <>
      <PageHeader
        title="Nacimientos"
        description="Registra y consulta los nacimientos del centro"
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      <div className="space-y-6">
        <Card title="Registrar nacimiento">
          <BirthForm onAdd={add} medicos={medicos} />
        </Card>

        <BirthFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
          medicos={medicos}
        />

        <section>
          <p className="mb-3 text-sm text-ink-muted">
            {loading
              ? 'Cargando...'
              : `${births.length} resultado${births.length === 1 ? '' : 's'}`}
          </p>
          <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <BirthTable births={births} onDelete={askDelete} filtered={hayFiltros} />
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar nacimiento"
        message={
          toDelete
            ? `¿Eliminar el nacimiento de ${toDelete.madre} del ${formatDate(
                toDelete.fechaHora
              )}? Se eliminarán también sus recién nacidos. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
