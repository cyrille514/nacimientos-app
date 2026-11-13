import { cx } from './cx'
import { LoaderCircle } from './icons'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800',
  secondary: 'border border-line bg-surface text-ink hover:bg-slate-50',
  ghost: 'text-ink-muted hover:bg-slate-100 hover:text-ink',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
  dangerGhost: 'text-danger-700 hover:bg-danger-50',
}

const sizes = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3 text-sm',
}

// Por defecto type="button". En formularios usa type="submit".
export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const extra = Component === 'button' ? { type, disabled: disabled || loading } : {}

  return (
    <Component
      className={cx(base, variants[variant], sizes[size], className)}
      {...extra}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </Component>
  )
}
