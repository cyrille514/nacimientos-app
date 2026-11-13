import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/usuariosService'
import ConfirmDialog from '../components/ConfirmDialog'
import PasswordDialog from '../components/PasswordDialog'
import { ROLES, formatDateTime } from '../constants/labels'
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  FormSection,
  Input,
  KeyRound,
  Plus,
  Select,
  Spinner,
  TBody,
  Table,
  THead,
  Td,
  Th,
  Tr,
  PageHeader,
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
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)

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

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
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
    await run(async () => {
      await api.createUser(body)
      setForm(initial)
    }, 'Usuario creado')
    setSaving(false)
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

  const esMedico = form.rol === 'medico'

  return (
    <>
      <PageHeader title="Usuarios" description="Gestiona las cuentas y los roles de acceso" />

      {error && <Alert className="mb-6">{error}</Alert>}
      {ok && (
        <Alert tone="success" className="mb-6">
          {ok}
        </Alert>
      )}

      <div className="space-y-6">
        <Card title="Nuevo usuario">
          <form onSubmit={handleCreate} className="space-y-4">
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
              <FormSection title="Datos del médico" columns={3} className="border-t border-line pt-4">
                <Field label="Apellidos">
                  <Input name="apellidos" value={form.apellidos} onChange={handleChange} required />
                </Field>
                <Field label="Nº de colegiado">
                  <Input name="numColegiado" value={form.numColegiado} onChange={handleChange} required />
                </Field>
                <Field label="Especialidad (opcional)">
                  <Input name="especialidad" value={form.especialidad} onChange={handleChange} />
                </Field>
              </FormSection>
            )}

            <div className="flex justify-end">
              <Button type="submit" icon={Plus} loading={saving}>
                Crear usuario
              </Button>
            </div>
          </form>
        </Card>

        {loading ? (
          <Spinner />
        ) : (
          <Card flush>
            <Table>
              <THead>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Último acceso</Th>
                <Th className="text-right">Acciones</Th>
              </THead>
              <TBody>
                {users.map((u) => {
                  const self = u.id === me.id
                  return (
                    <Tr key={u.id}>
                      <Td className="font-medium">
                        {u.nombre}
                        {self && <span className="font-normal text-ink-muted"> (tú)</span>}
                      </Td>
                      <Td>{u.email}</Td>
                      <Td>
                        {self || u.rol === 'medico' ? (
                          <Badge tone={u.rol === 'admin' ? 'brand' : 'neutral'}>{ROLES[u.rol]}</Badge>
                        ) : (
                          <Select
                            dense
                            className="w-auto"
                            value={u.rol}
                            onChange={(e) =>
                              run(() => api.updateUser(u.id, { rol: e.target.value }), 'Rol actualizado')
                            }
                          >
                            <option value="administrativo">Administrativo</option>
                            <option value="admin">Administrador</option>
                          </Select>
                        )}
                      </Td>
                      <Td>
                        <Badge tone={u.activo ? 'success' : 'neutral'}>
                          {u.activo ? 'Activo' : 'Desactivado'}
                        </Badge>
                      </Td>
                      <Td className="whitespace-nowrap text-ink-muted">
                        {u.ultimoAcceso ? formatDateTime(u.ultimoAcceso) : '—'}
                      </Td>
                      <Td className="whitespace-nowrap text-right">
                        <Button variant="ghost" size="sm" icon={KeyRound} onClick={() => openReset(u)}>
                          Contraseña
                        </Button>
                        {!self && (
                          <Button
                            variant={u.activo ? 'dangerGhost' : 'ghost'}
                            size="sm"
                            icon={u.activo ? UserX : UserCheck}
                            onClick={() => handleToggle(u)}
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          </Card>
        )}
      </div>

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
