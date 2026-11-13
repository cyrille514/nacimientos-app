import { useState } from 'react'
import { Button, Field, Input, Select } from './ui'

const toForm = (b) => ({
  nombre: b?.nombre ?? '',
  sexo: b?.sexo ?? 'F',
  pesoG: b?.pesoG ?? '',
  tallaCm: b?.tallaCm ?? '',
  apgar1: b?.apgar1 ?? '',
  apgar5: b?.apgar5 ?? '',
  estado: b?.estado ?? 'vivo',
})

const num = (v) => (v === '' || v === null ? null : Number(v))

export default function BabyForm({ initial, onSubmit, onCancel, submitLabel = 'Guardar' }) {
  const [form, setForm] = useState(toForm(initial))
  const [saving, setSaving] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSubmit({
      nombre: form.nombre.trim(),
      sexo: form.sexo,
      pesoG: Number(form.pesoG),
      tallaCm: num(form.tallaCm),
      apgar1: num(form.apgar1),
      apgar5: num(form.apgar5),
      estado: form.estado,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Nombre (opcional)">
          <Input name="nombre" value={form.nombre} onChange={handleChange} />
        </Field>
        <Field label="Sexo">
          <Select name="sexo" value={form.sexo} onChange={handleChange}>
            <option value="F">Niña</option>
            <option value="M">Niño</option>
            <option value="I">Indeterminado</option>
          </Select>
        </Field>
        <Field label="Estado">
          <Select name="estado" value={form.estado} onChange={handleChange}>
            <option value="vivo">Vivo</option>
            <option value="fallecido">Fallecido</option>
          </Select>
        </Field>
        <Field label="Peso (g)">
          <Input type="number" name="pesoG" min="300" max="7000" value={form.pesoG} onChange={handleChange} required />
        </Field>
        <Field label="Talla (cm)">
          <Input type="number" name="tallaCm" min="20" max="70" step="0.1" value={form.tallaCm} onChange={handleChange} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Apgar 1'">
            <Input type="number" name="apgar1" min="0" max="10" value={form.apgar1} onChange={handleChange} />
          </Field>
          <Field label="Apgar 5'">
            <Input type="number" name="apgar5" min="0" max="10" value={form.apgar5} onChange={handleChange} />
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
