import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BabiesSection from '../components/BabiesSection'
import BirthDetailForm from '../components/BirthDetailForm'
import { Alert, Button, Feedback, PageHeader, Pencil, Spinner } from '../components/ui'
import useBirthDetail from '../hooks/useBirthDetail'
import { formatDate } from '../utils/dates'

const BACK = { to: '/nacimientos', label: 'Volver a la lista' }

export default function BirthDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const detail = useBirthDetail(id)
  const [editing, setEditing] = useState(false)

  const { birth, medicos, feedback } = detail

  if (detail.loading) return <Spinner />

  if (!birth) {
    return (
      <>
        <PageHeader title="Nacimiento" back={BACK} />
        <Alert>{feedback.error || 'Nacimiento no encontrado'}</Alert>
      </>
    )
  }

  const startEdit = () => {
    feedback.clear()
    setEditing(true)
  }

  const save = async (form) => {
    const done = await detail.save(form)
    if (done) setEditing(false)
    return done
  }

  return (
    <>
      <PageHeader
        back={BACK}
        title={`Nacimiento del ${formatDate(birth.fechaHora)}`}
        description={`${birth.madre.nombre} ${birth.madre.apellidos} · ${birth.medico}`}
        actions={
          !editing && (
            <Button icon={Pencil} onClick={startEdit}>
              Editar datos
            </Button>
          )
        }
      />

      <Feedback error={feedback.error} ok={feedback.ok} />

      <BabiesSection
        birth={birth}
        isAdmin={user?.rol === 'admin'}
        onAdd={detail.addBaby}
        onUpdate={detail.updateBaby}
        onRemove={detail.removeBaby}
      />

      <BirthDetailForm
        key={editing ? 'edit' : 'view'}
        birth={birth}
        medicos={medicos}
        editing={editing}
        onSubmit={save}
        onCancel={() => setEditing(false)}
      />
    </>
  )
}
