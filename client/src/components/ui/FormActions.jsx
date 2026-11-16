import { cx } from './cx'

export default function FormActions({ className = '', children }) {
  return (
    <div
      className={cx(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end *:w-full sm:*:w-auto',
        className
      )}
    >
      {children}
    </div>
  )
}
