import { useEffect, useRef, useState } from 'react'

function PasswordForm({ user, loading, error, onSubmit, onCancel }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const rules = [
    { ok: password.length >= 8, label: 'Mínimo 8 caracteres' },
    { ok: /[a-z]/.test(password), label: 'Una minúscula' },
    { ok: /[A-Z]/.test(password), label: 'Una mayúscula' },
    { ok: /\d/.test(password), label: 'Un número' },
  ]
  const valid = rules.every((r) => r.ok)
  const mismatch = confirm !== '' && password !== confirm
  const canSubmit = valid && confirm !== '' && !mismatch && !loading

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSubmit) onSubmit(password)
  }

  const input = 'border rounded p-2 w-full bg-white'
  const type = show ? 'text' : 'password'

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        <p className="mt-1 text-sm text-gray-600">
          Nueva contraseña para <span className="font-medium">{user.email}</span>
        </p>
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</p>
      )}

      <div className="space-y-3">
        <input
          className={input}
          type={type}
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          maxLength={72}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className={input}
          type={type}
          placeholder="Repetir contraseña"
          autoComplete="new-password"
          maxLength={72}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {mismatch && (
          <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
        )}

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
          Mostrar contraseña
        </label>
      </div>

      <ul className="grid grid-cols-2 gap-1 text-sm">
        {rules.map((r) => (
          <li key={r.label} className={r.ok ? 'text-green-700' : 'text-gray-500'}>
            {r.ok ? '✓' : '○'} {r.label}
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="border rounded px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          disabled={!canSubmit}
          className="bg-pink-600 text-white rounded px-4 py-2 hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}

export default function PasswordDialog({ open, user, loading, error, onSubmit, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        if (!loading) onCancel()
      }}
      onClick={(e) => {
        if (e.target === ref.current && !loading) onCancel()
      }}
      className="m-auto w-full max-w-md rounded-lg p-0 text-gray-800 shadow-xl backdrop:bg-black/50"
    >
      {/* Se monta solo al abrir: los campos se vacían cada vez */}
      {open && user && (
        <PasswordForm
          user={user}
          loading={loading}
          error={error}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </dialog>
  )
}
