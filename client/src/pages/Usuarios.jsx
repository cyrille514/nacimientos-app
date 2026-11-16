import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/usuariosService'
import ConfirmDialog from '../components/ConfirmDialog'
import PasswordDialog from '../components/PasswordDialog'
import { ROLES, formatDateTime } from '../constants/labels'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  FormActions,
  FormSection,
  Input,
  KeyRound,
  PageHeader,
  Plus,
  Select,
  Sheet,
  Spinner,
  TBody,
  Table,
  THead,
  Td,
  Th,
  Tr,
  UserCheck,
  UserX,
} from '../components/ui'

const initial = {
  email: '',
  password: '',
  nombre: '',
  rol: 'administrativo',
  apellidos: '',
  numColegiado: '',
  especialidad: '',
}

export default function Usuarios() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')

  const [toDeactivate, setToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  const [toReset, setToReset] = useState(null)
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState('')

  const load = async () => {
    try {
      setUsers(await api.listUsers())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const run = async (fn, message) => {
    setError('')
    setOk('')
    try {
      await fn()
      if (message) setOk(message)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const openCreate = () => {
    setForm(initial)
    setCreateError('')
    setCreating(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setCreateError('')
    const body = {
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      rol: form.rol,
    }
    if (form.rol === 'medico') {
      body.medico = {
        apellidos: form.apellidos,
        numColegiado: form.numColegiado,
        especialidad: form.especialidad,
      }
    }
    try {
      await api.createUser(body)
      setCreating(false)
      setError('')
      setOk('Usuario creado')
      await load()
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openReset = (u) => {
    setResetError('')
    setToReset(u)
  }

  const closeReset = () => {
    setToReset(null)
    setResetError('')
  }

  const confirmReset = async (password) => {
    setResetting(true)
    setResetError('')
    try {
      await api.resetPassword(toReset.id, password)
      setOk(`Contraseña actualizada para ${toReset.email}`)
      setError('')
      setToReset(null)
    } catch (e) {
      setResetError(e.message)
    } finally {
      setResetting(false)
    }
  }

  const handleToggle = (u) => {
    if (u.activo) {
      setToDeactivate(u)
    } else {
      run(() => api.updateUser(u.id, { activo: true }), 'Usuario activado')
    }
  }

  const confirmDeactivate = async () => {
    setDeactivating(true)
    await run(
      () => api.updateUser(toDeactivate.id, { activo: false }),
      'Usuario desactivado'
    )
    setDeactivating(false)
    setToDeactivate(null)
  }

  const changeRole = (u, rol) =>
    run(() => api.updateUser(u.id, { rol }), 'Rol actualizado')

  const esMedico = form.rol === 'medico'

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona las cuentas y los roles de acceso"
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nuevo usuario
          </Button>
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}
      {ok && (
        <Alert tone="success" className="mb-6">
          {ok}
        </Alert>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Móvil: lista de tarjetas */}
          <Card flush className="md:hidden">
            <ul className="divide-y divide-line">
              {users.map((u) => {
                const self = u.id === me.id
                const canChangeRole = !self && u.rol !== 'medico'
                return (
                  <li key={u.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={u.nombre} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="break-words font-medium text-ink">
                          {u.nombre}
                          {self && <span className="font-normal text-ink-muted"> (tú)</span>}
                        </p>
                        <p className="break-all text-sm text-ink-muted">{u.email}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone={u.rol === 'admin' ? 'brand' : 'neutral'}>{ROLES[u.rol]}</Badge>
                          <Badge tone={u.activo ? 'success' : 'neutral'} dot>
                            {u.activo ? 'Activo' : 'Desactivado'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-ink-subtle">
                          Último acceso: {u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : '—'}
                        </p>
                      </div>
                    </div>

                    {canChangeRole && (
                      <Field label="Rol" className="mt-3">
                        <Select value={u.rol} onChange={(e) => changeRole(u, e.target.value)}>
                          <option value="administrativo">Administrativo</option>
                          <option value="admin">Administrador</option>
                        </Select>
                      </Field>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button variant="secondary" icon={KeyRound} className="flex-1" onClick={() => openReset(u)}>
                        Contraseña
                      </Button>
                      {!self && (
                        <Button
                          variant={u.activo ? 'dangerGhost' : 'secondary'}
                          icon={u.activo ? UserX : UserCheck}
                          className="flex-1"
                          onClick={() => handleToggle(u)}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Tablet y escritorio: tabla */}
          <Card flush className="hidden md:block">
            <Table>
              <THead>
                <Th>Usuario</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th className="hidden lg:table-cell">Último acceso</Th>
                <Th className="text-right">Acciones</Th>
              </THead>
              <TBody>
                {users.map((u) => {
                  const self = u.id === me.id
                  return (
                    <Tr key={u.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Avatar name={u.nombre} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {u.nombre}
                              {self && <span className="font-normal text-ink-muted"> (tú)</span>}
                            </p>
                            <p className="truncate text-xs text-ink-subtle">{u.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        {self || u.rol === 'medico' ? (
                          <Badge tone={u.rol === 'admin' ? 'brand' : 'neutral'}>{ROLES[u.rol]}</Badge>
                        ) : (
                          <Select
                            dense
                            aria-label={`Rol de ${u.nombre}`}
                            value={u.rol}
                            onChange={(e) => changeRole(u, e.target.value)}
                          >
                            <option value="administrativo">Administrativo</option>
                            <option value="admin">Administrador</option>
                          </Select>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={u.activo ? 'success' : 'neutral'} dot>
                          {u.activo ? 'Activo' : 'Desactivado'}
                        </Badge>
                      </Td>
                      <Td className="hidden whitespace-nowrap text-ink-muted lg:table-cell">
                        {u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : '—'}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={KeyRound}
                            aria-label={`Cambiar la contraseña de ${u.nombre}`}
                            onClick={() => openReset(u)}
                          >
                            <span className="sr-only xl:not-sr-only">Contraseña</span>
                          </Button>
                          {!self && (
                            <Button
                              variant={u.activo ? 'dangerGhost' : 'ghost'}
                              size="sm"
                              icon={u.activo ? UserX : UserCheck}
                              aria-label={`${u.activo ? 'Desactivar' : 'Activar'} a ${u.nombre}`}
                              onClick={() => handleToggle(u)}
                            >
                              <span className="sr-only xl:not-sr-only">
                                {u.activo ? 'Desactivar' : 'Activar'}
                              </span>
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          </Card>
        </>
      )}

      <Sheet
        open={creating}
        onClose={() => setCreating(false)}
        dismissible={!saving}
        title="Nuevo usuario"
        description="Crea una cuenta y asígnale un rol"
        footer={
          <FormActions>
            <Button variant="secondary" onClick={() => setCreating(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="user-form" icon={Plus} loading={saving}>
              Crear usuario
            </Button>
          </FormActions>
        }
      >
        {createError && <Alert className="mb-5">{createError}</Alert>}

        <form id="user-form" onSubmit={handleCreate} className="space-y-8">
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
                <option value="administrativo">Administrativo</option>
                <option value="medico">Médico</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
          </FormSection>

          {esMedico && (
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
      </Sheet>

      <PasswordDialog
        open={toReset !== null}
        user={toReset}
        loading={resetting}
        error={resetError}
        onSubmit={confirmReset}
        onCancel={closeReset}
      />

      <ConfirmDialog
        open={toDeactivate !== null}
        title="Desactivar usuario"
        message={
          toDeactivate
            ? `¿Desactivar la cuenta de ${toDeactivate.nombre} (${toDeactivate.email})? No podrá iniciar sesión hasta que la reactives.${
                toDeactivate.rol === 'medico'
                  ? ' Dejará de aparecer en la lista de médicos de los nacimientos.'
                  : ''
              }`
            : ''
        }
        confirmLabel="Desactivar"
        danger
        loading={deactivating}
        onConfirm={confirmDeactivate}
        onCancel={() => setToDeactivate(null)}
      />
    </>
  )
}
