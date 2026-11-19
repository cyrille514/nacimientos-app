import BirthFilters from '../components/BirthFilters'
import BirthForm from '../components/BirthForm'
import BirthTable from '../components/BirthTable'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button, Feedback, FormSheet, PageHeader, Plus } from '../components/ui'
import useBirthFilters from '../hooks/useBirthFilters'
import useBirths from '../hooks/useBirths'
import useDialogFlow from '../hooks/useDialogFlow'
import useFeedback from '../hooks/useFeedback'
import useMedicos from '../hooks/useMedicos'
import { formatDate } from '../utils/dates'

export default function Births() {
  const medicos = useMedicos()
  const { filters, setFilters, applied, reset, active } = useBirthFilters()
  const { births, loading, error: loadError, add, remove } = useBirths(applied)
  const feedback = useFeedback()

  // Alta: los errores se muestran dentro del panel
  const create = useDialogFlow(async (_, form) => {
    await add(form)
    feedback.clear()
    feedback.setOk('Nacimiento registrado')
  })

  // Baja: los errores se muestran en la pantalla
  const del = useDialogFlow((birth) => feedback.run(() => remove(birth.id)))

  const openCreate = () => {
    feedback.clear()
    create.openWith()
  }

  return (
    <>
      <PageHeader
        title="Nacimientos"
        description="Registra y consulta los nacimientos del centro"
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Nuevo nacimiento
          </Button>
        }
      />

      <Feedback error={loadError || feedback.error} ok={feedback.ok} />

      <div className="space-y-4">
        <BirthFilters filters={filters} onChange={setFilters} onReset={reset} medicos={medicos} />

        <p className="text-sm text-ink-muted">
          {loading
            ? 'Cargando...'
            : `${births.length} resultado${births.length === 1 ? '' : 's'}`}
        </p>

        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <BirthTable births={births} onDelete={del.openWith} filtered={active} />
        </div>
      </div>

      <FormSheet
        open={create.open}
        onClose={create.close}
        busy={create.busy}
        error={create.error}
        title="Nuevo nacimiento"
        description="Datos de la madre, del parto y del recién nacido"
        formId="birth-form"
        submitLabel="Registrar nacimiento"
        submitIcon={Plus}
      >
        <BirthForm onSubmit={create.submit} medicos={medicos} />
      </FormSheet>

      <ConfirmDialog
        open={del.open}
        title="Eliminar nacimiento"
        message={
          del.target
            ? `¿Eliminar el nacimiento de ${del.target.madre} del ${formatDate(
                del.target.fechaHora
              )}? Se eliminarán también sus recién nacidos. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        loading={del.busy}
        onConfirm={() => del.submit()}
        onCancel={del.close}
      />
    </>
  )
}
