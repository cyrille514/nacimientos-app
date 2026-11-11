import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
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
        // Échap : on laisse le parent décider de la fermeture
        e.preventDefault()
        if (!loading) onCancel()
      }}
      onClick={(e) => {
        // Clic sur le fond sombre
        if (e.target === ref.current && !loading) onCancel()
      }}
      className="m-auto w-full max-w-md rounded-lg p-0 text-gray-800 shadow-xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border rounded px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded px-4 py-2 text-white disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
