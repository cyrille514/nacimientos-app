import { cx } from './cx'

// text-base en móvil evita el zoom automático de iOS al enfocar un campo
const control =
  'block min-w-0 max-w-full rounded-control border border-line bg-surface px-3 text-base text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-slate-50 disabled:text-ink-subtle sm:text-sm'

const full = 'h-11 w-full sm:h-10'
const compact = 'h-10 w-auto sm:h-8'

export function Field({ label, hint, error, className = '', children }) {
  return (
    <label className={cx('block min-w-0', className)}>
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

export function Input({ className = '', ...props }) {
  return <input className={cx(control, full, className)} {...props} />
}

// dense: versión compacta para tablas
export function Select({ dense = false, className = '', children, ...props }) {
  return (
    <select className={cx(control, dense ? compact : full, className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cx(control, 'w-full py-2', className)} {...props} />
}
