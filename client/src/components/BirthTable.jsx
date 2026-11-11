import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const parto = { vaginal: 'Vaginal', cesarea: 'Cesárea', instrumental: 'Instrumental' }
const sexo = { F: 'Niña', M: 'Niño', I: 'Indeterminado' }

export default function BirthTable({ births, onDelete }) {
  const { user } = useAuth()

  if (births.length === 0)
    return <p className="text-gray-500 mt-6">No hay nacimientos registrados.</p>

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full bg-white rounded shadow text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Fecha</th>
            <th className="p-2">Madre</th>
            <th className="p-2">Médico</th>
            <th className="p-2">Recién nacido</th>
            <th className="p-2">Parto</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {births.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="p-2">{new Date(b.fechaHora).toLocaleString('es-ES')}</td>
              <td className="p-2">{b.madre}</td>
              <td className="p-2">{b.medico}</td>
              <td className="p-2">
                {b.recienNacidos.map((r) => (
                  <div key={r.id}>
                    {r.nombre ? `${r.nombre} · ` : ''}{sexo[r.sexo]} · {r.pesoG} g
                  </div>
                ))}
              </td>
              <td className="p-2">{parto[b.tipoParto]}</td>
              <td className="p-2 space-x-3 whitespace-nowrap">
                <Link to={`/nacimientos/${b.id}`} className="text-pink-600 hover:underline">
                  Ver
                </Link>
                {user?.rol === 'admin' && (
                  <button onClick={() => onDelete(b)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
