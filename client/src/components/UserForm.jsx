import { useState } from 'react'
import { ROLE_OPTIONS } from '../constants/labels'
import { EMPTY_USER_FORM } from '../utils/userMappers'
import { Field, FormSection, Input, Options, Select } from './ui'

// Solo recoge los valores; onSubmit(form) los entrega tal cual.
export default function UserForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY_USER_FORM)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
      <FormSection title="Cuenta">
        <Field label="Email">
          <Input type="email" name="email" autoComplete="off" value={form.email} onChange={handleChange} required />
        </Field>
        <Field label="Contraseña inicial" hint="Mínimo 8 caracteres, con mayúscula, minúscula y número.">
          <Input type="password" name="password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
        </Field>
        <Field label="Nombre">
          <Input name="nombre" value={form.nombre} onChange={handleChange} required />
        </Field>
        <Field label="Rol">
          <Select name="rol" value={form.rol} onChange={handleChange}>
            <Options map={ROLE_OPTIONS} />
          </Select>
        </Field>
      </FormSection>

      {form.rol === 'medico' && (
        <FormSection title="Datos del médico" className="border-t border-line pt-8">
          <Field label="Apellidos">
            <Input name="apellidos" value={form.apellidos} onChange={handleChange} required />
          </Field>
          <Field label="Nº de colegiado">
            <Input name="numColegiado" value={form.numColegiado} onChange={handleChange} required />
          </Field>
          <Field label="Especialidad (opcional)" className="col-span-full">
            <Input name="especialidad" value={form.especialidad} onChange={handleChange} />
          </Field>
        </FormSection>
      )}
    </form>
  )
}
