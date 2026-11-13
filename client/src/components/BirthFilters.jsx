import { Button, Card, Field, Input, Search, Select, X } from './ui'

export default function BirthFilters({ filters, onChange, onReset, medicos }) {
  const set = (e) => onChange({ ...filters, [e.target.name]: e.target.value })
  const hayFiltros = Object.values(filters).some(Boolean)

  return (
    <Card
      title="Buscar y filtrar"
      actions={
        <Button variant="ghost" size="sm" icon={X} onClick={onReset} disabled={!hayFiltros}>
          Limpiar filtros
        </Button>
      }
    >
      <div className="space-y-4">
        <Field label="Buscar madre">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              name="q"
              className="pl-9"
              placeholder="Nombre, apellidos o documento"
              value={filters.q}
              onChange={set}
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Desde">
            <Input type="date" name="desde" max={filters.hasta || undefined} value={filters.desde} onChange={set} />
          </Field>
          <Field label="Hasta">
            <Input type="date" name="hasta" min={filters.desde || undefined} value={filters.hasta} onChange={set} />
          </Field>
          <Field label="Médico">
            <Select name="medicoId" value={filters.medicoId} onChange={set}>
              <option value="">Todos</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tipo de parto">
            <Select name="tipoParto" value={filters.tipoParto} onChange={set}>
              <option value="">Todos</option>
              <option value="vaginal">Vaginal</option>
              <option value="cesarea">Cesárea</option>
              <option value="instrumental">Instrumental</option>
            </Select>
          </Field>
        </div>
      </div>
    </Card>
  )
}
