import useBirths from '../hooks/useBirths'

function Card({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-pink-600">{value}</p>
    </div>
  )
}

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
    <section>
      <h1 className="text-2xl font-bold mb-4">Panel</h1>

      {error && (
        <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
      )}
      {loading && <p className="text-gray-500 mb-4">Cargando...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Partos" value={births.length} />
        <Card title="Niñas / Niños" value={`${ninas} / ${ninos}`} />
        <Card title="Cesáreas" value={cesareas} />
        <Card title="Peso medio (g)" value={pesoMedio} />
      </div>
    </section>
  )
}
