import { Button, CircleAlert, Modal, ModalFooter, TriangleAlert } from './ui'

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
  return (
    <Modal
      open={open}
      onClose={onCancel}
      dismissible={!loading}
      icon={danger ? TriangleAlert : CircleAlert}
      tone={danger ? 'danger' : 'brand'}
      title={title}
      description={message}
    >
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
