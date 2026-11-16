import { Link } from 'react-router-dom'
import useBirths from '../hooks/useBirths'
import { PARTO, formatDateTime } from '../constants/labels'
import {
  Alert,
  Baby,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
  StatCard,
} from '../components/ui'

export default function Dashboard() {
  const { births, loading, error } = useBirths()

  const bebes = births.flatMap((b) => b.recienNacidos)
  const ninas = bebes.filter((r) => r.sexo === 'F').length
  const ninos = bebes.filter((r) => r.sexo === 'M').length
  const cesareas = births.filter((b) => b.tipoParto === 'cesarea').length
  const pctCesareas = births.length ? Math.round((cesareas / births.length) * 100) : 0
  const pesoMedio = bebes.length
    ? Math.round(bebes.reduce((s, r) => s + r.pesoG, 0) / bebes.length)
    : 0
  const recientes = births.slice(0, 5)

  return (
    <>
      <PageHeader title="Panel" description="Resumen de la actividad registrada" />

      {error && <Alert className="mb-6">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Partos" value={births.length} hint={`${bebes.length} recién nacidos`} />
            <StatCard label="Niñas / Niños" value={`${ninas} / ${ninos}`} />
            <StatCard label="Cesáreas" value={cesareas} hint={`${pctCesareas}% de los partos`} />
            <StatCard label="Peso medio" value={`${pesoMedio} g`} />
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

