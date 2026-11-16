import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/birthService'
import BabyCard from '../components/BabyCard'
import BabyForm from '../components/BabyForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { PARTO, formatDate, formatDateTime } from '../constants/labels'
import {
  Alert,
  Button,
  Card,
  DataField,
  FieldGrid,
  FormActions,
  Input,
  PageHeader,
  Pencil,
  Plus,
  Select,
  Spinner,
  Textarea,
} from '../components/ui'

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

  if (loading) return <Spinner />

  if (!birth) {
    return (
      <>
        <PageHeader title="Nacimiento" back={{ to: '/nacimientos', label: 'Volver a la lista' }} />
        <Alert>{error || 'Nacimiento no encontrado'}</Alert>
      </>
    )
  }

  const medicoOptions = medicos.some((m) => m.id === birth.medicoId)
    ? medicos
    : [{ id: birth.medicoId, nombre: birth.medico }, ...medicos]
  const puedeBorrarBebe = user?.rol === 'admin' && birth.recienNacidos.length > 1
  const bebeAEliminar = birth.recienNacidos.find((b) => b.id === toDelete)

  return (
    <>
      <PageHeader
        back={{ to: '/nacimientos', label: 'Volver a la lista' }}
        title={`Nacimiento del ${formatDate(birth.fechaHora)}`}
        description={`${birth.madre.nombre} ${birth.madre.apellidos} · ${birth.medico}`}
        actions={
          !editing && (
            <Button icon={Pencil} onClick={startEdit}>
              Editar datos
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}
      {ok && (
        <Alert tone="success" className="mb-6">
          {ok}
        </Alert>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">
            Recién nacidos ({birth.recienNacidos.length})
          </h2>
          {!adding && birth.recienNacidos.length < MAX_BEBES && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={() => setAdding(true)}>
              Añadir recién nacido
            </Button>
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
            <Card title="Nuevo recién nacido" description="Parto múltiple">
              <BabyForm
                submitLabel="Añadir"
                onCancel={() => setAdding(false)}
                onSubmit={handleAddBaby}
              />
            </Card>
          )}
        </div>
      </section>

      <form onSubmit={handleSave} className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card title="Parto" className="lg:col-span-2">
          <FieldGrid>
            <DataField label="Fecha y hora" editing={editing} value={formatDateTime(birth.fechaHora)}>
              <Input type="datetime-local" name="fechaHora" value={form?.fechaHora ?? ''} onChange={handleChange} required />
            </DataField>

            <DataField label="Médico responsable" editing={editing} value={birth.medico}>
              <Select name="medicoId" value={form?.medicoId ?? ''} onChange={handleChange} required>
                {medicoOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </DataField>

            <DataField label="Tipo de parto" editing={editing} value={PARTO[birth.tipoParto]}>
              <Select name="tipoParto" value={form?.tipoParto ?? ''} onChange={handleChange}>
                <option value="vaginal">Vaginal</option>
                <option value="cesarea">Cesárea</option>
                <option value="instrumental">Instrumental</option>
              </Select>
            </DataField>

            <DataField label="Lugar" editing={editing} value={birth.lugar}>
              <Input name="lugar" value={form?.lugar ?? ''} onChange={handleChange} required />
            </DataField>

            <DataField
              label="Semanas de gestación"
              editing={editing}
              value={birth.semanasGestacion ? `${birth.semanasGestacion} semanas` : ''}
            >
              <Input type="number" name="semanasGestacion" min="20" max="45" value={form?.semanasGestacion ?? ''} onChange={handleChange} />
            </DataField>

            <DataField label="Observaciones" editing={editing} value={birth.observaciones} className="col-span-full">
              <Textarea name="observaciones" rows={3} maxLength={1000} value={form?.observaciones ?? ''} onChange={handleChange} />
            </DataField>
          </FieldGrid>
        </Card>

        <Card title="Madre" description="Estos datos se aplican a todos sus partos.">
          <FieldGrid>
            <DataField label="Nombre" editing={editing} value={birth.madre.nombre}>
              <Input name="mNombre" value={form?.mNombre ?? ''} onChange={handleChange} required />
            </DataField>

            <DataField label="Apellidos" editing={editing} value={birth.madre.apellidos}>
              <Input name="mApellidos" value={form?.mApellidos ?? ''} onChange={handleChange} required />
            </DataField>

            <DataField label="Documento de identidad" value={birth.madre.documentoId} />

            <DataField
              label="Fecha de nacimiento"
              editing={editing}
              value={
                birth.madre.fechaNacimiento
                  ? formatDate(`${birth.madre.fechaNacimiento}T00:00:00`)
                  : ''
              }
            >
              <Input type="date" name="mFechaNac" value={form?.mFechaNac ?? ''} onChange={handleChange} required />
            </DataField>

            <DataField label="Teléfono" editing={editing} value={birth.madre.telefono}>
              <Input name="mTelefono" maxLength={30} value={form?.mTelefono ?? ''} onChange={handleChange} />
            </DataField>

            <DataField label="Dirección" editing={editing} value={birth.madre.direccion}>
              <Input name="mDireccion" maxLength={200} value={form?.mDireccion ?? ''} onChange={handleChange} />
            </DataField>
          </FieldGrid>
        </Card>

        {editing && (
          <FormActions className="lg:col-span-3">
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Guardar cambios
            </Button>
          </FormActions>
        )}
      </form>

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
    </>
  )
}
