import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PARTO, SEXO } from '../constants/labels'
import { formatDateTime } from '../utils/dates'
import {
  Baby,
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Eye,
  RowAction,
  Search,
  Trash2,
} from './ui'

function Babies({ list }) {
  return list.map((r) => (
    <div key={r.id} className="break-words">
      <span className="font-medium text-ink">{r.nombre || 'Sin nombre'}</span>
      <span className="text-ink-muted">
        {' '}· {SEXO[r.sexo]} · <span className="tabular-nums">{r.pesoG}</span> g
      </span>
    </div>
  ))
}

// Vista móvil de un nacimiento
function BirthCard({ birth, isAdmin, onDelete }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-medium text-ink">{birth.madre}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{formatDateTime(birth.fechaHora)}</p>
        </div>
        <Badge>{PARTO[birth.tipoParto]}</Badge>
      </div>
      <p className="mt-2 text-sm text-ink-muted">{birth.medico}</p>
      <div className="mt-1 text-sm">
        <Babies list={birth.recienNacidos} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button as={Link} to={`/nacimientos/${birth.id}`} variant="secondary" icon={Eye} className="flex-1">
          Ver ficha
        </Button>
        {isAdmin && (
          <Button
            variant="dangerGhost"
            icon={Trash2}
            aria-label={`Eliminar el nacimiento de ${birth.madre}`}
            onClick={() => onDelete(birth)}
          />
        )}
      </div>
    </>
  )
}

// onDelete recibe el nacimiento completo
export default function BirthTable({ births, onDelete, filtered = false }) {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'

  if (births.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={filtered ? Search : Baby}
          title={filtered ? 'Sin resultados' : 'Aún no hay nacimientos'}
          description={
            filtered
              ? 'Ningún nacimiento coincide con los filtros aplicados.'
              : 'Registra el primero con el botón «Nuevo nacimiento».'
          }
        />
      </Card>
    )
  }

  const columns = [
    {
      key: 'fecha',
      header: 'Fecha',
      cellClassName: 'whitespace-nowrap tabular-nums',
      cell: (b) => formatDateTime(b.fechaHora),
    },
    {
      key: 'madre',
      header: 'Madre',
      cell: (b) => (
        <>
          <p className="font-medium">{b.madre}</p>
          <p className="text-xs text-ink-subtle">{b.medico}</p>
        </>
      ),
    },
    { key: 'bebes', header: 'Recién nacidos', cell: (b) => <Babies list={b.recienNacidos} /> },
    { key: 'parto', header: 'Parto', cell: (b) => <Badge>{PARTO[b.tipoParto]}</Badge> },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (b) => (
        <div className="flex justify-end gap-1">
          <RowAction
            as={Link}
            to={`/nacimientos/${b.id}`}
            icon={Eye}
            label="Ver"
            ariaLabel={`Ver ficha de ${b.madre}`}
          />
          {isAdmin && (
            <RowAction
              variant="dangerGhost"
              icon={Trash2}
              label="Eliminar"
              ariaLabel={`Eliminar el nacimiento de ${b.madre}`}
              onClick={() => onDelete(b)}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      rows={births}
      rowKey={(b) => b.id}
      columns={columns}
      renderCard={(b) => <BirthCard birth={b} isAdmin={isAdmin} onDelete={onDelete} />}
    />
  )
}
