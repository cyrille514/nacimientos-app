const pad = (n) => String(n).padStart(2, '0')

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('es-ES', { dateStyle: 'medium' })

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })

// Para fechas sin hora ("2026-11-06")
export const formatDateOnly = (value) => formatDate(`${value}T00:00:00`)

// ISO (UTC) -> valor de <input type="datetime-local"> en hora local
export const toLocalInput = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Valor de <input type="datetime-local"> -> ISO (UTC)
export const fromLocalInput = (local) => new Date(local).toISOString()

export const startOfDayISO = (date) => new Date(`${date}T00:00:00`).toISOString()
export const endOfDayISO = (date) => new Date(`${date}T23:59:59.999`).toISOString()
