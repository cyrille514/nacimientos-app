import { useCallback, useEffect, useState } from 'react'
import * as api from '../services/usuariosService'
import { buildCreateUserPayload } from '../utils/userMappers'
import useFeedback from './useFeedback'

// Gestión de usuarios. `create` y `resetPassword` lanzan el error (se muestra en su diálogo);
// el resto de acciones devuelven true/false y dejan su mensaje en `feedback`.
export default function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const feedback = useFeedback()
  const { setError } = feedback

  const load = useCallback(async () => {
    try {
      setUsers(await api.listUsers())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [setError])

  useEffect(() => {
    load()
  }, [load])

  const act = (fn, message) =>
    feedback.run(async () => {
      await fn()
      await load()
    }, message)

  const create = async (form) => {
    await api.createUser(buildCreateUserPayload(form))
    feedback.clear()
    feedback.setOk('Usuario creado')
    await load()
  }

  const resetPassword = async (user, password) => {
    await api.resetPassword(user.id, password)
    feedback.clear()
    feedback.setOk(`Contraseña actualizada para ${user.email}`)
  }

  return {
    users,
    loading,
    feedback,
    create,
    resetPassword,
    setRole: (u, rol) => act(() => api.updateUser(u.id, { rol }), 'Rol actualizado'),
    activate: (u) => act(() => api.updateUser(u.id, { activo: true }), 'Usuario activado'),
    deactivate: (u) => act(() => api.updateUser(u.id, { activo: false }), 'Usuario desactivado'),
  }
}
