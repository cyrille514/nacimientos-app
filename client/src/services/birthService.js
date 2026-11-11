import { authFetch } from './authService'

const API = import.meta.env.VITE_API_URL

async function request(path, options) {
  const res = await authFetch(`${API}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = Array.isArray(body.error?.details)
      ? body.error.details[0]?.message
      : null
    throw new Error(detail || body.error?.message || 'Error en la petición')
  }
  return res.status === 204 ? null : res.json()
}

const json = (method, data) => ({ method, body: JSON.stringify(data) })

export const getBirths = (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  return request(`/nacimientos${qs ? `?${qs}` : ''}`)
}

export const addBirth = (birth) => request('/nacimientos', json('POST', birth))

export const deleteBirth = (id) =>
  request(`/nacimientos/${id}`, { method: 'DELETE' })

export const getBirth = (id) => request(`/nacimientos/${id}`)

export const updateBirth = (id, data) =>
  request(`/nacimientos/${id}`, json('PATCH', data))

export const addBaby = (id, data) =>
  request(`/nacimientos/${id}/recien-nacidos`, json('POST', data))

export const updateBaby = (id, rnId, data) =>
  request(`/nacimientos/${id}/recien-nacidos/${rnId}`, json('PATCH', data))

export const deleteBaby = (id, rnId) =>
  request(`/nacimientos/${id}/recien-nacidos/${rnId}`, { method: 'DELETE' })

export const getMedicos = () => request('/medicos')
