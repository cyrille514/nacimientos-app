import { cx } from './cx'

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm' }

export default function Avatar({ name, tone = 'light', size = 'sm', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizes[size],
        tone === 'dark' ? 'bg-white/10 text-white' : 'bg-brand-100 text-brand-800',
        className
      )}
    >
      {initials(name) || '?'}
    </span>
  )
}
