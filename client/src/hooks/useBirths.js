import { useState, useEffect } from 'react'
import { getBirths, addBirth, deleteBirth } from '../services/birthService'

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

  const add = async (birth) => {
    try {
      setError(null)
      await addBirth(birth)
      setReload((n) => n + 1) // recarga respetando los filtros activos
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }

  const remove = async (id) => {
    try {
      setError(null)
      await deleteBirth(id)
      setBirths((prev) => prev.filter((b) => b.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  return { births, loading, error, add, remove }
}
