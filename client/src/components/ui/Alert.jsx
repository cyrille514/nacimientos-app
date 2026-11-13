import { cx } from './cx'
import { CircleAlert, CircleCheck, Info, TriangleAlert } from './icons'

const tones = {
  error: { box: 'border-danger-100 bg-danger-50 text-danger-700', Icon: CircleAlert },
  success: { box: 'border-success-100 bg-success-50 text-success-700', Icon: CircleCheck },
  warning: { box: 'border-warning-100 bg-warning-50 text-warning-700', Icon: TriangleAlert },
  info: { box: 'border-info-100 bg-info-50 text-info-700', Icon: Info },
}

export default function Alert({ tone = 'error', className = '', children }) {
  const { box, Icon } = tones[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('flex items-start gap-3 rounded-control border px-4 py-3 text-sm', box, className)}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
