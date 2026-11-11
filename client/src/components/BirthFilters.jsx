export default function BirthFilters({ filters, onChange, onReset, medicos }) {
  const set = (e) => onChange({ ...filters, [e.target.name]: e.target.value })

  const input = 'border rounded p-2 w-full bg-white'
  const label = 'text-sm text-gray-600'
  const hayFiltros = Object.values(filters).some(Boolean)

  return (
    <div className="bg-white p-4 rounded shadow mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-pink-600">Buscar y filtrar</h2>
        {hayFiltros && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-pink-600 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={`${input} sm:col-span-2`}
          name="q"
          placeholder="Buscar por nombre, apellidos o documento de la madre"
          value={filters.q}
          onChange={set}
        />

        <div>
          <label className={label}>Desde</label>
          <input
            className={input}
            type="date"
            name="desde"
            max={filters.hasta || undefined}
            value={filters.desde}
            onChange={set}
          />
        </div>
        <div>
          <label className={label}>Hasta</label>
          <input
            className={input}
            type="date"
            name="hasta"
            min={filters.desde || undefined}
            value={filters.hasta}
            onChange={set}
          />
        </div>

        <select className={input} name="medicoId" value={filters.medicoId} onChange={set}>
          <option value="">Todos los médicos</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>

        <select className={input} name="tipoParto" value={filters.tipoParto} onChange={set}>
          <option value="">Todos los tipos de parto</option>
          <option value="vaginal">Vaginal</option>
          <option value="cesarea">Cesárea</option>
          <option value="instrumental">Instrumental</option>
        </select>
      </div>
    </div>
  )
}
