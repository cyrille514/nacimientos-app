import { useEffect, useState } from 'react'
import { getMedicos } from '../services/birthService'

export default function useMedicos() {
  const [medicos, setMedicos] = useState([])

  useEffect(() => {
    let cancelled = false

    getMedicos()
      .then((d) => {
        if (!cancelled) setMedicos(Array.isArray(d) ? d : [])
      })
      .catch(() => {
        if (!cancelled) setMedicos([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  return medicos
}
