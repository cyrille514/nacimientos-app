import { Link } from 'react-router-dom'
import useBirths from '../hooks/useBirths'
import { PARTO } from '../constants/labels'
import { formatDateTime } from '../utils/dates'
import { computeBirthStats } from '../utils/birthStats'
import { ChevronRight } from 'lucide-react';
import {
  Baby,
  Badge,
  Button,
  Card,
  EmptyState,
  Feedback,
  PageHeader,
  Spinner,
  StatCard,
} from '../components/ui'

export default function Dashboard() {
  const { births, loading, error } = useBirths()
  const stats = computeBirthStats(births)
  const recientes = births.slice(0, 5)

  return (
    <>
      <PageHeader title="Panel" description="Resumen de la actividad registrada" />

      <Feedback error={error} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Partos" value={stats.partos} hint={`${stats.bebes} recién nacidos`} />
            <StatCard label="Niñas / Niños" value={`${stats.ninas} / ${stats.ninos}`} />
            <StatCard label="Cesáreas" value={stats.cesareas} hint={`${stats.pctCesareas}% de los partos`} />
            <StatCard label="Peso medio" value={`${stats.pesoMedio} g`} />
          </div>

          <Card
            title="Últimos nacimientos"
            flush
            actions={
              <Button as={Link} to="/nacimientos" variant="ghost" size="sm">
                Ver todos
              </Button>
            }
          >
            {recientes.length === 0 ? (
              <EmptyState
                icon={Baby}
                title="Aún no hay nacimientos"
                description="Cuando registres el primero aparecerá aquí."
              />
            ) : (
              <ul className="divide-y divide-line">
                {recientes.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/nacimientos/${b.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 sm:gap-4 sm:px-5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{b.madre}</p>
                        <p className="truncate text-xs text-ink-subtle">
                          {formatDateTime(b.fechaHora)} · {b.medico}
                        </p>
                      </div>
                      <Badge className="hidden sm:inline-flex">{PARTO[b.tipoParto]}</Badge>
                      <span className="shrink-0 text-sm tabular-nums text-ink-muted">
                        {b.recienNacidos.length} {b.recienNacidos.length === 1 ? 'bebé' : 'bebés'}
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
