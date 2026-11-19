import { useEffect, useState } from 'react'
import * as api from '../services/birthService'
import { buildUpdateBirthPayload } from '../utils/birthMappers'
import { buildBabyPayload } from '../utils/babyMappers'
import useFeedback from './useFeedback'
import useMedicos from './useMedicos'

// Ficha de un nacimiento: carga y acciones. Cada acción devuelve true/false
// y deja su mensaje en `feedback`.
export default function useBirthDetail(id) {
  const [birth, setBirth] = useState(null)
  const [loading, setLoading] = useState(true)
  const medicos = useMedicos()
  const feedback = useFeedback()
  const { setError } = feedback

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    api
      .getBirth(id)
      .then((b) => {
        if (!cancelled) setBirth(b)
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
  }, [id, setError])

  // La API devuelve la ficha actualizada tras cada cambio
  const act = (fn, message) =>
    feedback.run(async () => {
      setBirth(await fn())
    }, message)

  return {
    birth,
    medicos,
    loading,
    feedback,
    save: (form) => act(() => api.updateBirth(id, buildUpdateBirthPayload(form)), 'Cambios guardados'),
    addBaby: (form) => act(() => api.addBaby(id, buildBabyPayload(form)), 'Recién nacido añadido'),
    updateBaby: (babyId, form) =>
      act(() => api.updateBaby(id, babyId, buildBabyPayload(form)), 'Recién nacido actualizado'),
    removeBaby: (babyId) => act(() => api.deleteBaby(id, babyId), 'Recién nacido eliminado'),
  }
}
