import { useState } from 'react'
import { PARTO, SEXO } from '../constants/labels'
import { EMPTY_BIRTH_FORM } from '../utils/birthMappers'
import { Field, FormSection, Input, Options, Select, Textarea } from './ui'

// Solo recoge los valores; onSubmit(form) devuelve true si se guardó.
export default function BirthForm({ onSubmit, medicos }) {
  const [form, setForm] = useState(EMPTY_BIRTH_FORM)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const done = await onSubmit(form)
    if (done) setForm(EMPTY_BIRTH_FORM)
  }

  return (
    <form id="birth-form" onSubmit={handleSubmit} className="space-y-8">
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

      <FormSection title="Parto" className="border-t border-line pt-8">
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
            <Options map={PARTO} />
          </Select>
        </Field>
        <Field label="Observaciones (opcional)" className="col-span-full">
          <Textarea name="observaciones" rows={3} maxLength={1000} value={form.observaciones} onChange={handleChange} />
        </Field>
      </FormSection>

      <FormSection title="Recién nacido" columns={3} className="border-t border-line pt-8">
        <Field label="Nombre (opcional)">
          <Input name="bebeNombre" value={form.bebeNombre} onChange={handleChange} />
        </Field>
        <Field label="Sexo">
          <Select name="sexo" value={form.sexo} onChange={handleChange}>
            <Options map={SEXO} />
          </Select>
        </Field>
        <Field label="Peso (g)">
          <Input type="number" name="pesoG" min="300" max="7000" value={form.pesoG} onChange={handleChange} required />
        </Field>
      </FormSection>
    </form>
  )
}
