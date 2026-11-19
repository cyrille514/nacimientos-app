import { useState } from 'react'
import { MAX_BABIES } from '../constants/labels'
import useDialogFlow from '../hooks/useDialogFlow'
import BabyCard from './BabyCard'
import BabyForm from './BabyForm'
import ConfirmDialog from './ConfirmDialog'
import { Button, Card, Plus } from './ui'

// onAdd(form), onUpdate(babyId, form) y onRemove(babyId) devuelven true si se completaron.
export default function BabiesSection({ birth, isAdmin, onAdd, onUpdate, onRemove }) {
  const [adding, setAdding] = useState(false)
  const removal = useDialogFlow((babyId) => onRemove(babyId))

  const babies = birth.recienNacidos
  const canDelete = isAdmin && babies.length > 1
  const babyToRemove = babies.find((b) => b.id === removal.target)

  const handleAdd = async (form) => {
    const done = await onAdd(form)
    if (done) setAdding(false)
  }

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Recién nacidos ({babies.length})</h2>
        {!adding && babies.length < MAX_BABIES && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setAdding(true)}>
            Añadir recién nacido
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {babies.map((b, i) => (
          <BabyCard
            key={b.id}
            birth={birth}
            baby={b}
            index={i}
            canDelete={canDelete}
            onUpdate={(form) => onUpdate(b.id, form)}
            onDelete={() => removal.openWith(b.id)}
          />
        ))}

        {adding && (
          <Card title="Nuevo recién nacido" description="Parto múltiple">
            <BabyForm submitLabel="Añadir" onCancel={() => setAdding(false)} onSubmit={handleAdd} />
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={removal.open}
        title="Eliminar recién nacido"
        message={`¿Seguro que quieres eliminar a ${
          babyToRemove?.nombre || 'este recién nacido'
        }? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={removal.busy}
        onConfirm={() => removal.submit()}
        onCancel={removal.close}
      />
    </section>
  )
}
