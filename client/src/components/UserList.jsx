import { ASSIGNABLE_ROLE_OPTIONS, ROLES } from '../constants/labels'
import { formatDateTime } from '../utils/dates'
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Field,
  KeyRound,
  Options,
  RowAction,
  Select,
  UserCheck,
  UserX,
} from './ui'

const toggleMeta = (u) =>
  u.activo
    ? { icon: UserX, label: 'Desactivar', variant: 'dangerGhost' }
    : { icon: UserCheck, label: 'Activar', variant: 'ghost' }

const RoleBadge = ({ user }) => (
  <Badge tone={user.rol === 'admin' ? 'brand' : 'neutral'}>{ROLES[user.rol]}</Badge>
)

const StatusBadge = ({ user }) => (
  <Badge tone={user.activo ? 'success' : 'neutral'} dot>
    {user.activo ? 'Activo' : 'Desactivado'}
  </Badge>
)

const SelfTag = () => <span className="font-normal text-ink-muted"> (tú)</span>

export default function UserList({ users, currentUserId, onChangeRole, onResetPassword, onToggle }) {
  const isSelf = (u) => u.id === currentUserId
  // Ni tu propia cuenta ni un médico cambian de rol
  const canChangeRole = (u) => !isSelf(u) && u.rol !== 'medico'

  const roleSelect = (u, props) => (
    <Select
      aria-label={`Rol de ${u.nombre}`}
      value={u.rol}
      onChange={(e) => onChangeRole(u, e.target.value)}
      {...props}
    >
      <Options map={ASSIGNABLE_ROLE_OPTIONS} />
    </Select>
  )

  const columns = [
    {
      key: 'usuario',
      header: 'Usuario',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.nombre} />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {u.nombre}
              {isSelf(u) && <SelfTag />}
            </p>
            <p className="truncate text-xs text-ink-subtle">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      cell: (u) => (canChangeRole(u) ? roleSelect(u, { dense: true }) : <RoleBadge user={u} />),
    },
    { key: 'estado', header: 'Estado', cell: (u) => <StatusBadge user={u} /> },
    {
      key: 'acceso',
      header: 'Último acceso',
      className: 'hidden lg:table-cell',
      cellClassName: 'whitespace-nowrap text-ink-muted',
      cell: (u) => (u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : '—'),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (u) => {
        const meta = toggleMeta(u)
        return (
          <div className="flex justify-end gap-1">
            <RowAction
              icon={KeyRound}
              label="Contraseña"
              ariaLabel={`Cambiar la contraseña de ${u.nombre}`}
              onClick={() => onResetPassword(u)}
            />
            {!isSelf(u) && (
              <RowAction
                icon={meta.icon}
                variant={meta.variant}
                label={meta.label}
                ariaLabel={`${meta.label} a ${u.nombre}`}
                onClick={() => onToggle(u)}
              />
            )}
          </div>
        )
      },
    },
  ]

  const renderCard = (u) => {
    const meta = toggleMeta(u)
    return (
      <>
        <div className="flex items-start gap-3">
          <Avatar name={u.nombre} size="md" />
          <div className="min-w-0 flex-1">
            <p className="break-words font-medium text-ink">
              {u.nombre}
              {isSelf(u) && <SelfTag />}
            </p>
            <p className="break-all text-sm text-ink-muted">{u.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RoleBadge user={u} />
              <StatusBadge user={u} />
            </div>
            <p className="mt-2 text-xs text-ink-subtle">
              Último acceso: {u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : '—'}
            </p>
          </div>
        </div>

        {canChangeRole(u) && (
          <Field label="Rol" className="mt-3">
            {roleSelect(u)}
          </Field>
        )}

        <div className="mt-3 flex gap-2">
          <Button variant="secondary" icon={KeyRound} className="flex-1" onClick={() => onResetPassword(u)}>
            Contraseña
          </Button>
          {!isSelf(u) && (
            <Button
              variant={meta.variant === 'ghost' ? 'secondary' : meta.variant}
              icon={meta.icon}
              className="flex-1"
              onClick={() => onToggle(u)}
            >
              {meta.label}
            </Button>
          )}
        </div>
      </>
    )
  }

  return <DataTable rows={users} rowKey={(u) => u.id} columns={columns} renderCard={renderCard} />
}
