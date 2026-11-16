import { cx } from './cx'
import { Baby } from './icons'

export default function Logo({ tone = 'light', className = '' }) {
  return (
    <span
      className={cx(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white',
        tone === 'dark' ? 'bg-brand-600' : 'bg-brand-700',
        className
      )}
    >
      <Baby size={18} />
    </span>
  )
}
