import { useState, useEffect } from 'react'
import useBirths from '../hooks/useBirths'
import { getMedicos } from '../services/birthService'
import BirthForm from '../components/BirthForm'
import BirthFilters from '../components/BirthFilters'
import BirthTable from '../components/BirthTable'
import ConfirmDialog from '../components/ConfirmDialog'
import { Alert, Button, FormActions, PageHeader, Plus, Sheet } from '../components/ui'
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
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { births, loading, error, add, remove, clearError } = useBirths(applied)

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

  const openCreate = () => {
    clearError()
    setOk('')
    setCreating(true)
  }

  const handleCreate = async (data) => {
    setSaving(true)
    const done = await add(data)
    setSaving(false)
    if (done) {
      setCreating(false)
      setOk('Nacimiento registrado')
    }
    return done
  }

  const askDelete = (id) => setToDelete(births.find((b) => b.id === id) ?? null)

  const confirmDelete = async () => {
    setDeleting(true)
    setOk('')
    await remove(toDelete.id)
    setDeleting(false)
    setToDelete(null)
  }

  return (
    <>
      <PageHeader
        title="Nacimientos"
        description="Registra y consulta los nacimientos del centro"
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nuevo nacimiento
          </Button>
        }
      />

      {error && !creating && <Alert className="mb-6">{error}</Alert>}
      {ok && (
        <Alert tone="success" className="mb-6">
          {ok}
        </Alert>
      )}

      <div className="space-y-4">
        <BirthFilters
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
          medicos={medicos}
        />

        <p className="text-sm text-ink-muted">
          {loading
            ? 'Cargando...'
            : `${births.length} resultado${births.length === 1 ? '' : 's'}`}
        </p>

        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <BirthTable births={births} onDelete={askDelete} filtered={hayFiltros} />
        </div>
      </div>

      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        dismissible={!saving}
        title="Nuevo nacimiento"
        description="Datos de la madre, del parto y del recién nacido"
        footer={
          <FormActions>
            <Button variant="secondary" onClick={() => setCreating(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="birth-form" icon={Plus} loading={saving}>
              Registrar nacimiento
            </Button>
          </FormActions>
        }
      >
        {error && <Alert className="mb-5">{error}</Alert>}
        {/* Se monta solo al abrir: los campos se vacían cada vez */}
        {creating && <BirthForm onAdd={handleCreate} medicos={medicos} />}
      </Sheet>

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
