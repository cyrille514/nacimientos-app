const API = import.meta.env.VITE_API_URL
const KEY = 'session'

export const getSession = () => JSON.parse(localStorage.getItem(KEY) || 'null')
const saveSession = (s) => localStorage.setItem(KEY, JSON.stringify(s))
export const clearSession = () => localStorage.removeItem(KEY)

async function post(path, body) {
  const res = await fetch(`${API}/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error?.message || 'Error en la petición')
  return data
}

export async function login(email, password) {
  const data = await post('/login', { email, password })
  saveSession(data)
  return data.user
}

export async function logout() {
  const s = getSession()
  if (s) {
    await fetch(`${API}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${s.session.accessToken}` },
    }).catch(() => {})
  }
  clearSession()
}

// fetch avec token; si le token expire, le renouvelle une fois et réessaie
export async function authFetch(url, options = {}, retry = true) {
  const s = getSession()
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${s?.session.accessToken}`,
    },
  })

  if (res.status === 401 && retry && s) {
    try {
      const { session } = await post('/refresh', {
        refreshToken: s.session.refreshToken,
      })
      saveSession({ ...s, session })
      return authFetch(url, options, false)
    } catch {
      clearSession()
      window.location.href = '/login'
    }
  }
  return res
}
