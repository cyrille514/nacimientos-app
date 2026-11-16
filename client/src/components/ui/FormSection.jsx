import { cx } from './cx'

const columnClasses = {
  1: '',
  2: '@md:grid-cols-2',
  3: '@md:grid-cols-2 @2xl:grid-cols-3',
}

export function FieldGrid({ columns = 2, className = '', children }) {
  return (
    <div className="@container">
      <div className={cx('grid grid-cols-1 gap-x-6 gap-y-5', columnClasses[columns], className)}>
        {children}
      </div>
    </div>
  )
}

export default function FormSection({ title, description, columns = 2, className = '', children }) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      <FieldGrid columns={columns} className="mt-4">
        {children}
      </FieldGrid>
    </div>
  )
}
