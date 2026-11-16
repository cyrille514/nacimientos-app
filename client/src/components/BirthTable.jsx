import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PARTO, SEXO, formatDateTime } from '../constants/labels'
import {
  Baby,
  Badge,
  Button,
  Card,
  EmptyState,
  Eye,
  Search,
  TBody,
  Table,
  THead,
  Td,
  Th,
  Tr,
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

  return (
    <>
      {/* Móvil: lista de tarjetas, sin scroll horizontal */}
      <Card flush className="md:hidden">
        <ul className="divide-y divide-line">
          {births.map((b) => (
            <li key={b.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-medium text-ink">{b.madre}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{formatDateTime(b.fechaHora)}</p>
                </div>
                <Badge>{PARTO[b.tipoParto]}</Badge>
              </div>
              <p className="mt-2 text-sm text-ink-muted">{b.medico}</p>
              <div className="mt-1 text-sm">
                <Babies list={b.recienNacidos} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  as={Link}
                  to={`/nacimientos/${b.id}`}
                  variant="secondary"
                  icon={Eye}
                  className="flex-1"
                >
                  Ver ficha
                </Button>
                {isAdmin && (
                  <Button
                    variant="dangerGhost"
                    icon={Trash2}
                    aria-label={`Eliminar el nacimiento de ${b.madre}`}
                    onClick={() => onDelete(b.id)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Tablet y escritorio: tabla */}
      <Card flush className="hidden md:block">
        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Madre</Th>
            <Th>Recién nacidos</Th>
            <Th>Parto</Th>
            <Th className="text-right">Acciones</Th>
          </THead>
          <TBody>
            {births.map((b) => (
              <Tr key={b.id}>
                <Td className="whitespace-nowrap tabular-nums">{formatDateTime(b.fechaHora)}</Td>
                <Td>
                  <p className="font-medium">{b.madre}</p>
                  <p className="text-xs text-ink-subtle">{b.medico}</p>
                </Td>
                <Td>
                  <Babies list={b.recienNacidos} />
                </Td>
                <Td>
                  <Badge>{PARTO[b.tipoParto]}</Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-1">
                    <Button
                      as={Link}
                      to={`/nacimientos/${b.id}`}
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      aria-label={`Ver ficha de ${b.madre}`}
                    >
                      <span className="sr-only xl:not-sr-only">Ver</span>
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="dangerGhost"
                        size="sm"
                        icon={Trash2}
                        aria-label={`Eliminar el nacimiento de ${b.madre}`}
                        onClick={() => onDelete(b.id)}
                      >
                        <span className="sr-only xl:not-sr-only">Eliminar</span>
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  )
}
