import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/birthService'
import BabyCard from '../components/BabyCard'
import BabyForm from '../components/BabyForm'
import ConfirmDialog from '../components/ConfirmDialog'

const PARTO = { vaginal: 'Vaginal', cesarea: 'Cesárea', instrumental: 'Instrumental' }
const MAX_BEBES = 5

const pad = (n) => String(n).padStart(2, '0')

// ISO (UTC) -> valor de <input type="datetime-local"> en hora local
const toLocalInput = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const toForm = (b) => ({
  fechaHora: toLocalInput(b.fechaHora),
  medicoId: b.medicoId,
  tipoParto: b.tipoParto,
  lugar: b.lugar ?? '',
  semanasGestacion: b.semanasGestacion ?? '',
  observaciones: b.observaciones ?? '',
  mNombre: b.madre.nombre,
  mApellidos: b.madre.apellidos,
  mFechaNac: b.madre.fechaNacimiento ?? '',
  mTelefono: b.madre.telefono ?? '',
  mDireccion: b.madre.direccion ?? '',
})

function Field({ label, editing, value, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-sm text-gray-600">{label}</p>
      {editing ? children : <p className="font-medium whitespace-pre-wrap">{value || '—'}</p>}
    </div>
  )
}

export default function BirthDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [birth, setBirth] = useState(null)
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [editing, setEditing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  const [toDelete, setToDelete] = useState(null) // id del bebé a eliminar
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([api.getBirth(id), api.getMedicos().catch(() => [])])
      .then(([b, m]) => {
        if (cancelled) return
        setBirth(b)
        setMedicos(Array.isArray(m) ? m : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  // Ejecuta una acción que devuelve la ficha actualizada
  const run = async (fn, message) => {
    setError('')
    setOk('')
    try {
      const data = await fn()
      setBirth(data)
      if (message) setOk(message)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  const startEdit = () => {
    setForm(toForm(birth))
    setOk('')
    setError('')
    setEditing(true)
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const done = await run(
      () =>
        api.updateBirth(id, {
          fechaHora: new Date(form.fechaHora).toISOString(),
          medicoId: form.medicoId,
          tipoParto: form.tipoParto,
          lugar: form.lugar,
          semanasGestacion:
            form.semanasGestacion === '' ? null : Number(form.semanasGestacion),
          observaciones: form.observaciones.trim() || null,
          madre: {
            nombre: form.mNombre,
            apellidos: form.mApellidos,
            fechaNacimiento: form.mFechaNac,
            telefono: form.mTelefono.trim() || null,
            direccion: form.mDireccion.trim() || null,
          },
        }),
      'Cambios guardados'
    )
    setSaving(false)
    if (done) setEditing(false)
  }

  const handleAddBaby = async (data) => {
    const done = await run(() => api.addBaby(id, data), 'Recién nacido añadido')
    if (done) setAdding(false)
  }

  const confirmDeleteBaby = async () => {
    setDeleting(true)
    await run(() => api.deleteBaby(id, toDelete), 'Recién nacido eliminado')
    setDeleting(false)
    setToDelete(null)
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>

  if (!birth) {
    return (
      <section>
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
          {error || 'Nacimiento no encontrado'}
        </p>
        <Link to="/nacimientos" className="text-pink-600 hover:underline">
          ← Volver a la lista
        </Link>
      </section>
    )
  }

  const input = 'border rounded p-2 w-full bg-white'
  const medicoOptions = medicos.some((m) => m.id === birth.medicoId)
    ? medicos
    : [{ id: birth.medicoId, nombre: birth.medico }, ...medicos]
  const puedeBorrarBebe = user?.rol === 'admin' && birth.recienNacidos.length > 1
  const bebeAEliminar = birth.recienNacidos.find((b) => b.id === toDelete)

  return (
    <section>
      <Link to="/nacimientos" className="text-pink-600 hover:underline text-sm">
        ← Volver a la lista
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-2 mb-4">
        <h1 className="text-2xl font-bold">
          Nacimiento del {new Date(birth.fechaHora).toLocaleDateString('es-ES')}
        </h1>
        {!editing && (
          <button
            onClick={startEdit}
            className="bg-pink-600 text-white rounded px-4 py-2 hover:bg-pink-700"
          >
            Editar datos
          </button>
        )}
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
      )}
      {ok && (
        <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{ok}</p>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-pink-600 mb-3">Parto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Fecha y hora"
              editing={editing}
              value={new Date(birth.fechaHora).toLocaleString('es-ES')}
            >
              <input className={input} type="datetime-local" name="fechaHora" value={form?.fechaHora ?? ''} onChange={handleChange} required />
            </Field>

            <Field label="Médico responsable" editing={editing} value={birth.medico}>
              <select className={input} name="medicoId" value={form?.medicoId ?? ''} onChange={handleChange} required>
                {medicoOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de parto" editing={editing} value={PARTO[birth.tipoParto]}>
              <select className={input} name="tipoParto" value={form?.tipoParto ?? ''} onChange={handleChange}>
                <option value="vaginal">Vaginal</option>
                <option value="cesarea">Cesárea</option>
                <option value="instrumental">Instrumental</option>
              </select>
            </Field>

            <Field label="Lugar" editing={editing} value={birth.lugar}>
              <input className={input} name="lugar" value={form?.lugar ?? ''} onChange={handleChange} required />
            </Field>

            <Field
              label="Semanas de gestación"
              editing={editing}
              value={birth.semanasGestacion ? `${birth.semanasGestacion} semanas` : ''}
            >
              <input className={input} type="number" name="semanasGestacion" min="20" max="45" value={form?.semanasGestacion ?? ''} onChange={handleChange} />
            </Field>

            <Field label="Observaciones" editing={editing} value={birth.observaciones} className="sm:col-span-2">
              <textarea className={input} rows="3" name="observaciones" maxLength="1000" value={form?.observaciones ?? ''} onChange={handleChange} />
            </Field>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold text-pink-600 mb-1">Madre</h2>
          <p className="text-xs text-gray-500 mb-3">
            Estos datos se aplican a todos los partos de la misma madre.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" editing={editing} value={birth.madre.nombre}>
              <input className={input} name="mNombre" value={form?.mNombre ?? ''} onChange={handleChange} required />
            </Field>

            <Field label="Apellidos" editing={editing} value={birth.madre.apellidos}>
              <input className={input} name="mApellidos" value={form?.mApellidos ?? ''} onChange={handleChange} required />
            </Field>

            <div>
              <p className="text-sm text-gray-600">Documento de identidad</p>
              <p className="font-medium">{birth.madre.documentoId}</p>
            </div>

            <Field
              label="Fecha de nacimiento"
              editing={editing}
              value={
                birth.madre.fechaNacimiento
                  ? new Date(`${birth.madre.fechaNacimiento}T00:00:00`).toLocaleDateString('es-ES')
                  : ''
              }
            >
              <input className={input} type="date" name="mFechaNac" value={form?.mFechaNac ?? ''} onChange={handleChange} required />
            </Field>

            <Field label="Teléfono" editing={editing} value={birth.madre.telefono}>
              <input className={input} name="mTelefono" maxLength="30" value={form?.mTelefono ?? ''} onChange={handleChange} />
            </Field>

            <Field label="Dirección" editing={editing} value={birth.madre.direccion}>
              <input className={input} name="mDireccion" maxLength="200" value={form?.mDireccion ?? ''} onChange={handleChange} />
            </Field>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3">
            <button
              disabled={saving}
              className="bg-pink-600 text-white rounded px-4 py-2 hover:bg-pink-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border rounded px-4 py-2 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        )}
      </form>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold text-pink-600">
            Recién nacidos ({birth.recienNacidos.length})
          </h2>
          {!adding && birth.recienNacidos.length < MAX_BEBES && (
            <button
              onClick={() => setAdding(true)}
              className="border border-pink-600 text-pink-600 rounded px-3 py-1 text-sm hover:bg-pink-50"
            >
              + Añadir recién nacido (parto múltiple)
            </button>
          )}
        </div>

        <div className="space-y-3">
          {birth.recienNacidos.map((b, i) => (
            <BabyCard
              key={b.id}
              birth={birth}
              
              baby={b}
              index={i}
              canDelete={puedeBorrarBebe}
              onUpdate={(data) =>
                run(() => api.updateBaby(id, b.id, data), 'Recién nacido actualizado')
              }
              onDelete={() => setToDelete(b.id)}
            />
          ))}

          {adding && (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-medium mb-3">Nuevo recién nacido</h3>
              <BabyForm
                submitLabel="Añadir"
                onCancel={() => setAdding(false)}
                onSubmit={handleAddBaby}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar recién nacido"
        message={`¿Seguro que quieres eliminar a ${
          bebeAEliminar?.nombre || 'este recién nacido'
        }? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onConfirm={confirmDeleteBaby}
        onCancel={() => setToDelete(null)}
      />
    </section>
  )
}
