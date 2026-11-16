import { useEffect, useRef } from 'react'
import { cx } from './cx'
import FormActions from './FormActions'

const iconTones = {
  brand: 'bg-brand-50 text-brand-700',
  danger: 'bg-danger-50 text-danger-700',
}

export default function Modal({
  open,
  onClose,
  dismissible = true,
  icon: Icon,
  tone = 'brand',
  title,
  description,
  children,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault() // Esc: lo decide el componente padre
        if (dismissible) onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current && dismissible) onClose() // clic en el fondo
      }}
      className="modal m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-line bg-surface p-0 text-ink shadow-pop backdrop:bg-ink/40"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {Icon && (
            <span
              className={cx(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                iconTones[tone]
              )}
            >
              <Icon size={20} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
            {description && (
              <p className="mt-1 break-words text-sm text-ink-muted">{description}</p>
            )}
          </div>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  )
}

export function ModalFooter({ children }) {
  return <FormActions className="pt-1">{children}</FormActions>
}
