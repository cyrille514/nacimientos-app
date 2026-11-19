import Alert from './Alert'
import Button from './Button'
import FormActions from './FormActions'
import Sheet from './Sheet'

// Panel lateral con un formulario: el botón de enviar apunta al formulario por su id.
export default function FormSheet({
  open,
  onClose,
  busy = false,
  error,
  title,
  description,
  formId,
  submitLabel,
  submitIcon,
  children,
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={title}
      description={description}
      footer={
        <FormActions>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} icon={submitIcon} loading={busy}>
            {submitLabel}
          </Button>
        </FormActions>
      }
    >
      {error && <Alert className="mb-5">{error}</Alert>}
      {/* Se monta solo al abrir: los campos se vacían cada vez */}
      {open && children}
    </Sheet>
  )
}
