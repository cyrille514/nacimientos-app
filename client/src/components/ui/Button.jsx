import { cx } from './cx'
import { LoaderCircle } from './icons'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800',
  secondary: 'border border-line bg-surface text-ink shadow-sm hover:bg-slate-50',
  ghost: 'text-ink-muted hover:bg-slate-100 hover:text-ink',
  danger: 'bg-danger-600 text-white shadow-sm hover:bg-danger-700',
  dangerGhost: 'text-danger-700 hover:bg-danger-50',
}

// En móvil los botones miden 44 px (40 px los pequeños) para pulsar con el dedo
const sizes = {
  md: 'h-11 px-4 sm:h-10',
  sm: 'h-10 px-3 sm:h-8',
}

const squareSizes = {
  md: 'h-11 w-11 shrink-0 sm:h-10 sm:w-10',
  sm: 'h-10 w-10 shrink-0 sm:h-8 sm:w-8',
}

// Por defecto type="button". En formularios usa type="submit".
// Un botón con icono y sin texto es cuadrado: añade aria-label.
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
  const square = Boolean(Icon) && !children

  return (
    <Component
      className={cx(base, variants[variant], square ? squareSizes[size] : sizes[size], className)}
      {...extra}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </Component>
  )
}
