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
        'rounded-card border border-line bg-surface shadow-card',
        flush && 'overflow-hidden',
        className
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  )
}
