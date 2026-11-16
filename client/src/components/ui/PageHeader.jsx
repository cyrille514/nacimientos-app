import { Link } from 'react-router-dom'
import { ArrowLeft } from './icons'

export default function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 lg:mb-8">
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={16} />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 *:w-full sm:*:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
