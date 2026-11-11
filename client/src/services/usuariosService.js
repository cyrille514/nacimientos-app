import { authFetch } from './authService'

const API = import.meta.env.VITE_API_URL

async function request(path = '', options) {
  const res = await authFetch(`${API}/usuarios${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = Array.isArray(body.error?.details)
      ? body.error.details[0]?.message
      : null
    throw new Error(detail || body.error?.message || 'Error en la petición')
  }
  return res.status === 204 ? null : res.json()
}

export const listUsers = () => request()

export const createUser = (data) =>
  request('', { method: 'POST', body: JSON.stringify(data) })

export const updateUser = (id, data) =>
  request(`/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const resetPassword = (id, newPassword) =>
  request(`/${id}/password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  })
