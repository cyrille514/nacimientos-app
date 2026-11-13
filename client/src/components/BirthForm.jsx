import { useState } from 'react'
import { Button, Field, FormSection, Input, Plus, Select, Textarea } from './ui'

const initial = {
  nombre: '',
  apellidos: '',
  documentoId: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  medicoId: '',
  fechaHora: '',
  tipoParto: 'vaginal',
  observaciones: '',
  bebeNombre: '',
  sexo: 'F',
  pesoG: '',
}

export default function BirthForm({ onAdd, medicos }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const ok = await onAdd({
      madre: {
        nombre: form.nombre,
        apellidos: form.apellidos,
        documentoId: form.documentoId,
        fechaNacimiento: form.fechaNacimiento,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
      },
      medicoId: form.medicoId,
      fechaHora: new Date(form.fechaHora).toISOString(),
      tipoParto: form.tipoParto,
      observaciones: form.observaciones.trim(),
      recienNacido: {
        nombre: form.bebeNombre,
        sexo: form.sexo,
        pesoG: Number(form.pesoG),
      },
    })
    setSaving(false)
    if (ok) setForm(initial)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Madre">
        <Field label="Nombre">
          <Input name="nombre" value={form.nombre} onChange={handleChange} required />
        </Field>
        <Field label="Apellidos">
          <Input name="apellidos" value={form.apellidos} onChange={handleChange} required />
        </Field>
        <Field label="Documento de identidad">
          <Input name="documentoId" value={form.documentoId} onChange={handleChange} required />
        </Field>
        <Field label="Fecha de nacimiento">
          <Input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
        </Field>
        <Field label="Teléfono (opcional)">
          <Input name="telefono" maxLength={30} value={form.telefono} onChange={handleChange} />
        </Field>
        <Field label="Dirección (opcional)">
          <Input name="direccion" maxLength={200} value={form.direccion} onChange={handleChange} />
        </Field>
      </FormSection>

      <FormSection title="Parto" className="border-t border-line pt-6">
        <Field label="Fecha y hora">
          <Input type="datetime-local" name="fechaHora" value={form.fechaHora} onChange={handleChange} required />
        </Field>
        <Field label="Médico responsable">
          <Select name="medicoId" value={form.medicoId} onChange={handleChange} required>
            <option value="">Selecciona un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
                {m.especialidad ? ` (${m.especialidad})` : ''}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tipo de parto">
          <Select name="tipoParto" value={form.tipoParto} onChange={handleChange}>
            <option value="vaginal">Vaginal</option>
            <option value="cesarea">Cesárea</option>
            <option value="instrumental">Instrumental</option>
          </Select>
        </Field>
        <Field label="Observaciones (opcional)" className="sm:col-span-2">
          <Textarea name="observaciones" rows={3} maxLength={1000} value={form.observaciones} onChange={handleChange} />
        </Field>
      </FormSection>

      <FormSection title="Recién nacido" columns={3} className="border-t border-line pt-6">
        <Field label="Nombre (opcional)">
          <Input name="bebeNombre" value={form.bebeNombre} onChange={handleChange} />
        </Field>
        <Field label="Sexo">
          <Select name="sexo" value={form.sexo} onChange={handleChange}>
            <option value="F">Niña</option>
            <option value="M">Niño</option>
            <option value="I">Indeterminado</option>
          </Select>
        </Field>
        <Field label="Peso (g)">
          <Input type="number" name="pesoG" min="300" max="7000" value={form.pesoG} onChange={handleChange} required />
        </Field>
      </FormSection>

      <div className="flex justify-end border-t border-line pt-6">
        <Button type="submit" icon={Plus} loading={saving}>
          Registrar nacimiento
        </Button>
      </div>
    </form>
  )
}
