import useBirths from '../hooks/useBirths'
import { Alert, Baby, PageHeader, Scale, Spinner, StatCard, Stethoscope, Users } from '../components/ui'

export default function Dashboard() {
  const { births, loading, error } = useBirths()

  const bebes = births.flatMap((b) => b.recienNacidos)
  const ninas = bebes.filter((r) => r.sexo === 'F').length
  const ninos = bebes.filter((r) => r.sexo === 'M').length
  const cesareas = births.filter((b) => b.tipoParto === 'cesarea').length
  const pesoMedio = bebes.length
    ? Math.round(bebes.reduce((s, r) => s + r.pesoG, 0) / bebes.length)
    : 0

  return (
    <>
      <PageHeader title="Panel" description="Resumen de los nacimientos registrados" />

      {error && <Alert className="mb-6">{error}</Alert>}

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Partos" value={births.length} icon={Baby} hint={`${bebes.length} recién nacidos`} />
          <StatCard label="Niñas / Niños" value={`${ninas} / ${ninos}`} icon={Users} />
          <StatCard label="Cesáreas" value={cesareas} icon={Stethoscope} />
          <StatCard label="Peso medio" value={`${pesoMedio} g`} icon={Scale} />
        </div>
      )}
    </>
  )
}
