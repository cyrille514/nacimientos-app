import { useState } from 'react'
import { isStrongPassword, passwordRules } from '../utils/password'
import { Alert, Button, Check, Field, Input, KeyRound, Modal, ModalFooter, cx } from './ui'

function PasswordForm({ loading, error, onSubmit, onCancel }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)

  const rules = passwordRules(password)
  const mismatch = confirm !== '' && password !== confirm
  const canSubmit = isStrongPassword(password) && confirm !== '' && !mismatch && !loading
  const type = show ? 'text' : 'password'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSubmit) onSubmit(password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert>{error}</Alert>}

      <Field label="Nueva contraseña">
        <Input
          type={type}
          autoComplete="new-password"
          maxLength={72}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Repetir contraseña" error={mismatch ? 'Las contraseñas no coinciden' : undefined}>
        <Input
          type={type}
          autoComplete="new-password"
          maxLength={72}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-line accent-brand-700"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
        />
        Mostrar contraseña
      </label>

      <ul className="grid grid-cols-2 gap-1.5 text-sm">
        {rules.map((r) => (
          <li
            key={r.label}
            className={cx('flex items-center gap-1.5', r.ok ? 'text-success-700' : 'text-ink-subtle')}
          >
            <Check size={14} className={r.ok ? '' : 'opacity-30'} />
            {r.label}
          </li>
        ))}
      </ul>

      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!canSubmit} loading={loading}>
          Cambiar contraseña
        </Button>
      </ModalFooter>
    </form>
  )
}

export default function PasswordDialog({ open, user, loading, error, onSubmit, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      dismissible={!loading}
      icon={KeyRound}
      title="Cambiar contraseña"
      description={user ? `Nueva contraseña para ${user.email}` : ''}
    >
      {/* Se monta solo al abrir: los campos se vacían cada vez */}
      {open && user && (
        <PasswordForm loading={loading} error={error} onSubmit={onSubmit} onCancel={onCancel} />
      )}
    </Modal>
  )
}
