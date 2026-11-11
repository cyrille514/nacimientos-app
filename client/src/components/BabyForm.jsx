import { useState } from 'react'

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

  const input = 'border rounded p-2 w-full bg-white'
  const label = 'text-sm text-gray-600'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={label}>Nombre (opcional)</label>
          <input className={input} name="nombre" value={form.nombre} onChange={handleChange} />
        </div>
        <div>
          <label className={label}>Sexo</label>
          <select className={input} name="sexo" value={form.sexo} onChange={handleChange}>
            <option value="F">Niña</option>
            <option value="M">Niño</option>
            <option value="I">Indeterminado</option>
          </select>
        </div>
        <div>
          <label className={label}>Estado</label>
          <select className={input} name="estado" value={form.estado} onChange={handleChange}>
            <option value="vivo">Vivo</option>
            <option value="fallecido">Fallecido</option>
          </select>
        </div>
        <div>
          <label className={label}>Peso (g)</label>
          <input className={input} type="number" name="pesoG" min="300" max="7000" value={form.pesoG} onChange={handleChange} required />
        </div>
        <div>
          <label className={label}>Talla (cm)</label>
          <input className={input} type="number" name="tallaCm" min="20" max="70" step="0.1" value={form.tallaCm} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Apgar 1'</label>
            <input className={input} type="number" name="apgar1" min="0" max="10" value={form.apgar1} onChange={handleChange} />
          </div>
          <div>
            <label className={label}>Apgar 5'</label>
            <input className={input} type="number" name="apgar5" min="0" max="10" value={form.apgar5} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          disabled={saving}
          className="bg-pink-600 text-white rounded px-4 py-2 hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border rounded px-4 py-2 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
