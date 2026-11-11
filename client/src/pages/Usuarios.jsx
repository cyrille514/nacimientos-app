import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/usuariosService'
import ConfirmDialog from '../components/ConfirmDialog'
import PasswordDialog from '../components/PasswordDialog'

const ROLES = {
  admin: 'Administrador',
  medico: 'Médico',
  administrativo: 'Administrativo',
}

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

  const [toReset, setToReset] = useState(null) // usuario cuya contraseña se cambia
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

  const input = 'border rounded p-2 w-full bg-white'
  const esMedico = form.rol === 'medico'

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
      )}
      {ok && (
        <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{ok}</p>
      )}

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-pink-600">Nuevo usuario</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className={input} type="email" name="email" placeholder="Email" autoComplete="off" value={form.email} onChange={handleChange} required />
          <input className={input} type="password" name="password" placeholder="Contraseña inicial" autoComplete="new-password" value={form.password} onChange={handleChange} required />
          <input className={input} name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <select className={input} name="rol" value={form.rol} onChange={handleChange}>
            <option value="administrativo">Administrativo</option>
            <option value="medico">Médico</option>
            <option value="admin">Administrador</option>
          </select>

          {esMedico && (
            <>
              <input className={input} name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required />
              <input className={input} name="numColegiado" placeholder="Nº de colegiado" value={form.numColegiado} onChange={handleChange} required />
              <input className={input} name="especialidad" placeholder="Especialidad (opcional)" value={form.especialidad} onChange={handleChange} />
            </>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Contraseña: mínimo 8 caracteres, con mayúscula, minúscula y número.
        </p>

        <button
          disabled={saving}
          className="w-full bg-pink-600 text-white rounded p-2 hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 mt-6">Cargando...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full bg-white rounded shadow text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">Email</th>
                <th className="p-2">Rol</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Último acceso</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === me.id
                return (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.nombre}{self && ' (tú)'}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      {self || u.rol === 'medico' ? (
                        ROLES[u.rol]
                      ) : (
                        <select
                          className="border rounded p-1 bg-white"
                          value={u.rol}
                          onChange={(e) =>
                            run(() => api.updateUser(u.id, { rol: e.target.value }), 'Rol actualizado')
                          }
                        >
                          <option value="administrativo">Administrativo</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {u.activo ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="p-2">
                      {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-ES') : '—'}
                    </td>
                    <td className="p-2 space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => openReset(u)}
                        className="text-pink-600 hover:underline"
                      >
                        Contraseña
                      </button>
                      {!self && (
                        <button
                          onClick={() => handleToggle(u)}
                          className="text-red-600 hover:underline"
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

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
    </section>
  )
}
