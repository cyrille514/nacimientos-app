import { authFetch } from './authService'

const API = import.meta.env.VITE_API_URL

// Petición autenticada: devuelve el JSON o lanza un Error con el mensaje de la API
export async function request(path, options) {
  const res = await authFetch(`${API}${path}`, options)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = Array.isArray(body.error?.details) ? body.error.details[0]?.message : null
    throw new Error(detail || body.error?.message || 'Error en la petición')
  }

  return res.status === 204 ? null : res.json()
}

export const json = (method, data) => ({ method, body: JSON.stringify(data) })
