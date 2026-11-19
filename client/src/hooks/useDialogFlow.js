import { useState } from 'react'

// Flujo de un diálogo o panel (confirmación, alta, cambio de contraseña…):
// guarda el elemento afectado, el estado «ocupado» y el error del envío.
// action(target, ...args) debe lanzar un Error si falla; el mensaje se muestra en el diálogo.
// Llama siempre a openWith dentro de una función: onClick={() => flow.openWith(item)}.
export default function useDialogFlow(action) {
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const openWith = (value = true) => {
    setError('')
    setTarget(value)
  }

  const close = () => setTarget(null)

  const submit = async (...args) => {
    setBusy(true)
    setError('')
    try {
      await action(target, ...args)
      setTarget(null)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  return { open: target !== null, target, busy, error, openWith, close, submit }
}
