import { useState } from 'react'
import { PARTO } from '../constants/labels'
import { formatDateOnly, formatDateTime } from '../utils/dates'
import { birthToEditForm } from '../utils/birthMappers'
import {
  Button,
  Card,
  DataField,
  FieldGrid,
  FormActions,
  Input,
  Options,
  Select,
  Textarea,
} from './ui'

// Muestra Parto y Madre; con editing=true se convierten en campos.
// El padre lo remonta (key) al entrar o salir de la edición, para partir de los datos vigentes.
// onSubmit(form) devuelve true si se guardó.
export default function BirthDetailForm({ birth, medicos, editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => birthToEditForm(birth))
  const [saving, setSaving] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
  }

  // Si el médico de la ficha está inactivo, se mantiene como opción
  const medicoOptions = medicos.some((m) => m.id === birth.medicoId)
    ? medicos
    : [{ id: birth.medicoId, nombre: birth.medico }, ...medicos]

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-3">
      <Card title="Parto" className="lg:col-span-2">
        <FieldGrid>
          <DataField label="Fecha y hora" editing={editing} value={formatDateTime(birth.fechaHora)}>
            <Input type="datetime-local" name="fechaHora" value={form.fechaHora} onChange={handleChange} required />
          </DataField>

          <DataField label="Médico responsable" editing={editing} value={birth.medico}>
            <Select name="medicoId" value={form.medicoId} onChange={handleChange} required>
              {medicoOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </Select>
          </DataField>

          <DataField label="Tipo de parto" editing={editing} value={PARTO[birth.tipoParto]}>
            <Select name="tipoParto" value={form.tipoParto} onChange={handleChange}>
              <Options map={PARTO} />
            </Select>
          </DataField>

          <DataField label="Lugar" editing={editing} value={birth.lugar}>
            <Input name="lugar" value={form.lugar} onChange={handleChange} required />
          </DataField>

          <DataField
            label="Semanas de gestación"
            editing={editing}
            value={birth.semanasGestacion ? `${birth.semanasGestacion} semanas` : ''}
          >
            <Input type="number" name="semanasGestacion" min="20" max="45" value={form.semanasGestacion} onChange={handleChange} />
          </DataField>

          <DataField label="Observaciones" editing={editing} value={birth.observaciones} className="col-span-full">
            <Textarea name="observaciones" rows={3} maxLength={1000} value={form.observaciones} onChange={handleChange} />
          </DataField>
        </FieldGrid>
      </Card>

      <Card title="Madre" description="Estos datos se aplican a todos sus partos.">
        <FieldGrid>
          <DataField label="Nombre" editing={editing} value={birth.madre.nombre}>
            <Input name="mNombre" value={form.mNombre} onChange={handleChange} required />
          </DataField>

          <DataField label="Apellidos" editing={editing} value={birth.madre.apellidos}>
            <Input name="mApellidos" value={form.mApellidos} onChange={handleChange} required />
          </DataField>

          <DataField label="Documento de identidad" value={birth.madre.documentoId} />

          <DataField
            label="Fecha de nacimiento"
            editing={editing}
            value={birth.madre.fechaNacimiento ? formatDateOnly(birth.madre.fechaNacimiento) : ''}
          >
            <Input type="date" name="mFechaNac" value={form.mFechaNac} onChange={handleChange} required />
          </DataField>

          <DataField label="Teléfono" editing={editing} value={birth.madre.telefono}>
            <Input name="mTelefono" maxLength={30} value={form.mTelefono} onChange={handleChange} />
          </DataField>

          <DataField label="Dirección" editing={editing} value={birth.madre.direccion}>
            <Input name="mDireccion" maxLength={200} value={form.mDireccion} onChange={handleChange} />
          </DataField>
        </FieldGrid>
      </Card>

      {editing && (
        <FormActions className="lg:col-span-3">
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Guardar cambios
          </Button>
        </FormActions>
      )}
    </form>
  )
}
