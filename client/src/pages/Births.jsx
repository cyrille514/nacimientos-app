import { useState, useEffect } from 'react'
import useBirths from '../hooks/useBirths'
import { getMedicos } from '../services/birthService'
import BirthForm from '../components/BirthForm'
import BirthFilters from '../components/BirthFilters'
import BirthTable from '../components/BirthTable'
import ConfirmDialog from '../components/ConfirmDialog'

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
  const [toDelete, setToDelete] = useState(null) // registro a eliminar
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

  const confirmDelete = async () => {
    setDeleting(true)
    await remove(toDelete.id)
    setDeleting(false)
    setToDelete(null)
  }

  const hayFiltros = Object.values(filters).some(Boolean)

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Nacimientos</h1>

      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
      )}

      <BirthForm onAdd={add} medicos={medicos} />

      <BirthFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
        medicos={medicos}
      />

      <p className="text-sm text-gray-500 mt-4">
        {loading
          ? 'Cargando...'
          : `${births.length} resultado${births.length === 1 ? '' : 's'}`}
      </p>

      <div className={loading ? 'opacity-60' : ''}>
        {!loading && births.length === 0 && hayFiltros ? (
          <p className="text-gray-500 mt-2">
            Ningún nacimiento coincide con los filtros.
          </p>
        ) : (
          <BirthTable births={births} onDelete={setToDelete} />
        )}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar nacimiento"
        message={`¿Seguro que quieres eliminar el nacimiento de ${
          toDelete?.madre ?? ''
        } del ${
          toDelete ? new Date(toDelete.fechaHora).toLocaleDateString('es-ES') : ''
        }? Se eliminarán también sus recién nacidos. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  )
}
