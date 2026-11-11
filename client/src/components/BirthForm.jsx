import { useState } from 'react'

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

  const input = 'border rounded p-2 w-full bg-white'
  const label = 'text-sm text-gray-600'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow space-y-4"
    >
      <h2 className="font-semibold text-pink-600">Madre</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className={input} name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
        <input className={input} name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
        <input className={input} name="documentoId" placeholder="Documento de identidad" value={form.documentoId} onChange={handleChange} required />
        <div>
          <label className={label}>Fecha de nacimiento de la madre</label>
          <input className={input} type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} required />
        </div>
        <input className={input} name="telefono" maxLength="30" placeholder="Teléfono (opcional)" value={form.telefono} onChange={handleChange} />
        <input className={input} name="direccion" maxLength="200" placeholder="Dirección (opcional)" value={form.direccion} onChange={handleChange} />
      </div>

      <h2 className="font-semibold text-pink-600">Parto</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={label}>Fecha y hora</label>
          <input className={input} type="datetime-local" name="fechaHora" value={form.fechaHora} onChange={handleChange} required />
        </div>
        <div>
          <label className={label}>Médico responsable</label>
          <select className={input} name="medicoId" value={form.medicoId} onChange={handleChange} required>
            <option value="">Selecciona un médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}{m.especialidad ? ` (${m.especialidad})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Tipo de parto</label>
          <select className={input} name="tipoParto" value={form.tipoParto} onChange={handleChange}>
            <option value="vaginal">Vaginal</option>
            <option value="cesarea">Cesárea</option>
            <option value="instrumental">Instrumental</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={label}>Observaciones (opcional)</label>
          <textarea className={input} rows="3" name="observaciones" maxLength="1000" value={form.observaciones} onChange={handleChange} />
        </div>
      </div>

      <h2 className="font-semibold text-pink-600">Recién nacido</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className={input} name="bebeNombre" placeholder="Nombre (opcional)" value={form.bebeNombre} onChange={handleChange} />
        <select className={input} name="sexo" value={form.sexo} onChange={handleChange}>
          <option value="F">Niña</option>
          <option value="M">Niño</option>
          <option value="I">Indeterminado</option>
        </select>
        <input className={input} type="number" name="pesoG" min="300" max="7000" placeholder="Peso (g)" value={form.pesoG} onChange={handleChange} required />
      </div>

      <button
        disabled={saving}
        className="w-full bg-pink-600 text-white rounded p-2 hover:bg-pink-700 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Registrar nacimiento'}
      </button>
    </form>
  )
}
