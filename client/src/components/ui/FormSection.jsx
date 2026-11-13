import { cx } from './cx'

const columnClasses = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }

export default function FormSection({ title, columns = 2, className = '', children }) {
  return (
    <div className={className}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">{title}</h3>
      <div className={cx('grid grid-cols-1 gap-4', columnClasses[columns])}>{children}</div>
    </div>
  )
}
