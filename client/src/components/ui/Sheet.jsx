import { useEffect, useRef } from 'react'
import Button from './Button'
import { X } from './icons'

export default function Sheet({
  open,
  onClose,
  dismissible = true,
  title,
  description,
  footer,
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
        e.preventDefault()
        if (dismissible) onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current && dismissible) onClose()
      }}
      className="sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-surface p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col md:inset-y-0 md:left-auto md:right-0 md:w-[34rem] md:border-l md:border-line md:shadow-pop"
    >
      <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          aria-label="Cerrar"
          onClick={onClose}
          disabled={!dismissible}
        />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">{children}</div>

      {footer && (
        <footer className="border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          {footer}
        </footer>
      )}
    </dialog>
  )
}
