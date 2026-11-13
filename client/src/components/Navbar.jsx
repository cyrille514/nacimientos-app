import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants/labels'
import { Baby, Button, LayoutDashboard, LogOut, Users, cx } from './ui'

const linkClass = ({ isActive }) =>
  cx(
    'inline-flex h-9 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-800'
      : 'text-ink-muted hover:bg-slate-100 hover:text-ink'
  )

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-brand-700 text-white">
            <Baby size={20} />
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-ink md:block">
            Gestión de Nacimientos
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass} aria-label="Panel">
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Panel</span>
          </NavLink>
          <NavLink to="/nacimientos" className={linkClass} aria-label="Nacimientos">
            <Baby size={16} />
            <span className="hidden sm:inline">Nacimientos</span>
          </NavLink>
          {user?.rol === 'admin' && (
            <NavLink to="/usuarios" className={linkClass} aria-label="Usuarios">
              <Users size={16} />
              <span className="hidden sm:inline">Usuarios</span>
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium text-ink">{user?.nombre}</p>
            <p className="text-xs text-ink-subtle">{ROLES[user?.rol]}</p>
          </div>
          <Button variant="secondary" size="sm" icon={LogOut} onClick={logout}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  )
}
