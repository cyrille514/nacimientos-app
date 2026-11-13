import { cx } from './cx'

const control =
  'block w-full rounded-control border border-line bg-surface px-3 text-sm text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-slate-50 disabled:text-ink-subtle'

export function Field({ label, hint, error, className = '', children }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger-700">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-ink-subtle">{hint}</span>
      )}
    </label>
  )
}

export function Input({ dense = false, className = '', ...props }) {
  return <input className={cx(control, dense ? 'h-8' : 'h-10', className)} {...props} />
}

export function Select({ dense = false, className = '', children, ...props }) {
  return (
    <select className={cx(control, dense ? 'h-8' : 'h-10', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cx(control, 'py-2', className)} {...props} />
}
