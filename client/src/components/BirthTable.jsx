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

export default function BirthTable({ births, onDelete, filtered = false }) {
  const { user } = useAuth()

  if (births.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={filtered ? Search : Baby}
          title={filtered ? 'Sin resultados' : 'Aún no hay nacimientos'}
          description={
            filtered
              ? 'Ningún nacimiento coincide con los filtros aplicados.'
              : 'Registra el primero con el formulario de arriba.'
          }
        />
      </Card>
    )
  }

  return (
    <Card flush>
      <Table>
        <THead>
          <Th>Fecha</Th>
          <Th>Madre</Th>
          <Th>Médico</Th>
          <Th>Recién nacido</Th>
          <Th>Parto</Th>
          <Th className="text-right">Acciones</Th>
        </THead>
        <TBody>
          {births.map((b) => (
            <Tr key={b.id}>
              <Td className="whitespace-nowrap">{formatDateTime(b.fechaHora)}</Td>
              <Td className="font-medium">{b.madre}</Td>
              <Td>{b.medico}</Td>
              <Td>
                {b.recienNacidos.map((r) => (
                  <div key={r.id}>
                    <span className="font-medium">{r.nombre || 'Sin nombre'}</span>
                    <span className="text-ink-muted">
                      {' '}· {SEXO[r.sexo]} · {r.pesoG} g
                    </span>
                  </div>
                ))}
              </Td>
              <Td>
                <Badge>{PARTO[b.tipoParto]}</Badge>
              </Td>
              <Td className="whitespace-nowrap text-right">
                <Button as={Link} to={`/nacimientos/${b.id}`} variant="ghost" size="sm" icon={Eye}>
                  Ver
                </Button>
                {user?.rol === 'admin' && (
                  <Button variant="dangerGhost" size="sm" icon={Trash2} onClick={() => onDelete(b.id)}>
                    Eliminar
                  </Button>
                )}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  )
}
