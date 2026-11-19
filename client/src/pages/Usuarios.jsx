import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import PasswordDialog from '../components/PasswordDialog'
import UserForm from '../components/UserForm'
import UserList from '../components/UserList'
import { Button, Feedback, FormSheet, PageHeader, Plus, Spinner } from '../components/ui'
import useDialogFlow from '../hooks/useDialogFlow'
import useUsers from '../hooks/useUsers'

const deactivationMessage = (u) =>
  `¿Desactivar la cuenta de ${u.nombre} (${u.email})? No podrá iniciar sesión hasta que la reactives.${
    u.rol === 'medico' ? ' Dejará de aparecer en la lista de médicos de los nacimientos.' : ''
  }`

export default function Usuarios() {
  const { user: me } = useAuth()
  const { users, loading, feedback, create, resetPassword, setRole, activate, deactivate } =
    useUsers()

  const createFlow = useDialogFlow((_, form) => create(form))
  const resetFlow = useDialogFlow((user, password) => resetPassword(user, password))
  const deactivateFlow = useDialogFlow((user) => deactivate(user))

  const toggle = (u) => (u.activo ? deactivateFlow.openWith(u) : activate(u))

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona las cuentas y los roles de acceso"
        actions={
          <Button icon={Plus} onClick={() => createFlow.openWith()}>
            Nuevo usuario
          </Button>
        }
      />

      <Feedback error={feedback.error} ok={feedback.ok} />

      {loading ? (
        <Spinner />
      ) : (
        <UserList
          users={users}
          currentUserId={me.id}
          onChangeRole={setRole}
          onResetPassword={resetFlow.openWith}
          onToggle={toggle}
        />
      )}

      <FormSheet
        open={createFlow.open}
        onClose={createFlow.close}
        busy={createFlow.busy}
        error={createFlow.error}
        title="Nuevo usuario"
        description="Crea una cuenta y asígnale un rol"
        formId="user-form"
        submitLabel="Crear usuario"
        submitIcon={Plus}
      >
        <UserForm onSubmit={createFlow.submit} />
      </FormSheet>

      <PasswordDialog
        open={resetFlow.open}
        user={resetFlow.target}
        loading={resetFlow.busy}
        error={resetFlow.error}
        onSubmit={resetFlow.submit}
        onCancel={resetFlow.close}
      />

      <ConfirmDialog
        open={deactivateFlow.open}
        title="Desactivar usuario"
        message={deactivateFlow.target ? deactivationMessage(deactivateFlow.target) : ''}
        confirmLabel="Desactivar"
        danger
        loading={deactivateFlow.busy}
        onConfirm={() => deactivateFlow.submit()}
        onCancel={deactivateFlow.close}
      />
    </>
  )
}
