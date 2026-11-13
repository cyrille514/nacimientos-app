import { cx } from './cx'
import { LoaderCircle } from './icons'

export default function Spinner({ label = 'Cargando...', className = '' }) {
  return (
    <div role="status" className={cx('flex items-center gap-2 text-sm text-ink-muted', className)}>
      <LoaderCircle size={16} className="animate-spin" />
      {label}
    </div>
  )
}
