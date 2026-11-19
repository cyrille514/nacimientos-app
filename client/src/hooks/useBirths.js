import { useEffect, useState } from 'react'
import { addBirth, deleteBirth, getBirths } from '../services/birthService'
import { buildCreateBirthPayload } from '../utils/birthMappers'

// Lista de nacimientos con filtros. `error` es solo el de la carga.
export default function useBirths(filters = {}) {
  const [births, setBirths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reload, setReload] = useState(0)

  const key = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    getBirths(JSON.parse(key))
      .then((data) => {
        if (cancelled) return
        setBirths(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [key, reload])

  // Recibe los valores del formulario; lanza un Error si falla
  const add = async (form) => {
    await addBirth(buildCreateBirthPayload(form))
    setReload((n) => n + 1) // recarga respetando los filtros activos
  }

  const remove = async (id) => {
    await deleteBirth(id)
    setBirths((prev) => prev.filter((b) => b.id !== id))
  }

  return { births, loading, error, add, remove }
}
