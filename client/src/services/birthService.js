import { json, request } from './http'

export const getBirths = (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  const qs = params.toString()
  return request(`/nacimientos${qs ? `?${qs}` : ''}`)
}

export const getBirth = (id) => request(`/nacimientos/${id}`)

export const addBirth = (birth) => request('/nacimientos', json('POST', birth))

export const updateBirth = (id, data) => request(`/nacimientos/${id}`, json('PATCH', data))

export const deleteBirth = (id) => request(`/nacimientos/${id}`, { method: 'DELETE' })

export const addBaby = (id, data) =>
  request(`/nacimientos/${id}/recien-nacidos`, json('POST', data))

export const updateBaby = (id, babyId, data) =>
  request(`/nacimientos/${id}/recien-nacidos/${babyId}`, json('PATCH', data))

export const deleteBaby = (id, babyId) =>
  request(`/nacimientos/${id}/recien-nacidos/${babyId}`, { method: 'DELETE' })

export const getMedicos = () => request('/medicos')
