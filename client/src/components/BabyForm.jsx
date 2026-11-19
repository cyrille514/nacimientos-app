import { useState } from 'react'
import { ESTADO_BEBE, SEXO } from '../constants/labels'
import { babyToForm } from '../utils/babyMappers'
import { Button, Field, FieldGrid, FormActions, Input, Options, Select } from './ui'

// Solo recoge los valores; onSubmit(form) los entrega tal cual.
export default function BabyForm({ initial, onSubmit, onCancel, submitLabel = 'Guardar' }) {
  const [form, setForm] = useState(() => babyToForm(initial))
  const [saving, setSaving] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldGrid columns={3}>
        <Field label="Nombre (opcional)">
          <Input name="nombre" value={form.nombre} onChange={handleChange} />
        </Field>
        <Field label="Sexo">
          <Select name="sexo" value={form.sexo} onChange={handleChange}>
            <Options map={SEXO} />
          </Select>
        </Field>
        <Field label="Estado">
          <Select name="estado" value={form.estado} onChange={handleChange}>
            <Options map={ESTADO_BEBE} />
          </Select>
        </Field>
        <Field label="Peso (g)">
          <Input type="number" name="pesoG" min="300" max="7000" value={form.pesoG} onChange={handleChange} required />
        </Field>
        <Field label="Talla (cm)">
          <Input type="number" name="tallaCm" min="20" max="70" step="0.1" value={form.tallaCm} onChange={handleChange} />
        </Field>
        <Field label="Apgar 1'">
          <Input type="number" name="apgar1" min="0" max="10" value={form.apgar1} onChange={handleChange} />
        </Field>
        <Field label="Apgar 5'">
          <Input type="number" name="apgar5" min="0" max="10" value={form.apgar5} onChange={handleChange} />
        </Field>
      </FieldGrid>

      <FormActions>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </FormActions>
    </form>
  )
}
