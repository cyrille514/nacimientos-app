import { Field } from './Field'

export default function DataField({ label, value, editing = false, className = '', children }) {
  if (editing) {
    return (
      <Field label={label} className={className}>
        {children}
      </Field>
    )
  }

  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-ink">{value || '—'}</p>
    </div>
  )
}
