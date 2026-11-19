import { useState } from 'react'
import { PARTO } from '../constants/labels'
import { SlidersHorizontal } from 'lucide-react';
import {
  Badge,
  Button,
  Field,
  Input,
  Options,
  Search,
  Select,
  X,
  cx,
} from './ui'

export default function BirthFilters({ filters, onChange, onReset, medicos }) {
  const [open, setOpen] = useState(false) // solo afecta a móvil

  const set = (e) => onChange({ ...filters, [e.target.name]: e.target.value })
  const hayFiltros = Object.values(filters).some(Boolean)
  const activos = ['desde', 'hasta', 'medicoId', 'tipoParto'].filter((k) => filters[k]).length

  return (
    <div className="rounded-card border border-line bg-surface p-3 shadow-card sm:p-4">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            name="q"
            aria-label="Buscar madre"
            className="pl-9"
            placeholder="Buscar por nombre, apellidos o documento"
            value={filters.q}
            onChange={set}
          />
        </div>

        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          className="md:hidden"
          aria-label="Filtros"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {activos > 0 && <Badge tone="brand">{activos}</Badge>}
        </Button>
      </div>

      {/* Móvil: plegable. Tablet y escritorio: siempre visible. */}
      <div
        className={cx(
          'mt-3 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
          open ? 'grid' : 'hidden md:grid'
        )}
      >
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
            <Options map={PARTO} placeholder="Todos" />
          </Select>
        </Field>
      </div>

      {hayFiltros && (
        <div className="mt-2">
          <Button variant="ghost" size="sm" icon={X} onClick={onReset}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
