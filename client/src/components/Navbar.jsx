import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const link = ({ isActive }) =>
  `px-3 py-1 rounded ${isActive ? 'bg-white text-pink-600' : 'text-white hover:bg-pink-500'}`

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-pink-600 p-4 flex flex-wrap items-center gap-4">
      <span className="font-bold text-white mr-4">👶 Gestión de Nacimientos</span>
      <NavLink to="/" end className={link}>Panel</NavLink>
      <NavLink to="/nacimientos" className={link}>Nacimientos</NavLink>
      {user?.rol === 'admin' && (
        <NavLink to="/usuarios" className={link}>Usuarios</NavLink>
      )}

      <div className="ml-auto flex items-center gap-3 text-white text-sm">
        <span>{user?.nombre} ({user?.rol})</span>
        <button onClick={logout} className="bg-white text-pink-600 px-3 py-1 rounded hover:bg-pink-100">
          Salir
        </button>
      </div>
    </nav>
  )
}

