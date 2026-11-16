import { cx } from './cx'

export default function Card({
  title,
  description,
  actions,
  flush = false,
  className = '',
  children,
}) {
  return (
    <section
      className={cx(
        'min-w-0 rounded-card border border-line bg-surface shadow-card',
        flush && 'overflow-hidden',
        className
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? '' : 'p-4 sm:p-5'}>{children}</div>
    </section>
  )
}
