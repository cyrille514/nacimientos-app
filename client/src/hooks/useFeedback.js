import { useCallback, useState } from 'react'

// Mensajes de error y de éxito de una pantalla.
// run(fn, mensaje): ejecuta fn, muestra el error si falla y devuelve true/false.
export default function useFeedback() {
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const clear = useCallback(() => {
    setError('')
    setOk('')
  }, [])

  const run = useCallback(async (fn, message) => {
    setError('')
    setOk('')
    try {
      await fn()
      if (message) setOk(message)
      return true
    } catch (e) {
      setError(e.message)
      return false
    }
  }, [])

  return { error, ok, setError, setOk, clear, run }
}
