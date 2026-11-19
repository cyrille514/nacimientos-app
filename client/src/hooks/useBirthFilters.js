import { useCallback, useEffect, useState } from 'react'
import { EMPTY_FILTERS, filtersToApi } from '../utils/birthMappers'

// filters: lo que se ve en pantalla. applied: lo que se envía a la API (con 400 ms de espera).
export default function useBirthFilters(delay = 400) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [applied, setApplied] = useState(() => filtersToApi(EMPTY_FILTERS))

  useEffect(() => {
    const t = setTimeout(() => setApplied(filtersToApi(filters)), delay)
    return () => clearTimeout(t)
  }, [filters, delay])

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), [])
  const active = Object.values(filters).some(Boolean)

  return { filters, setFilters, applied, reset, active }
}
