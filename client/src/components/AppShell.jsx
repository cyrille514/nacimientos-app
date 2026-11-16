import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../constants/labels'
import { Avatar, Badge, Baby, LayoutDashboard, Logo, LogOut, Users, cx } from './ui'

const ITEMS = [
  { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/nacimientos', label: 'Nacimientos', icon: Baby },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
]

// Tablet (md): solo iconos. Escritorio (lg): iconos y texto.
function Sidebar({ items, user, onLogout }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col bg-sidebar md:flex lg:w-60">
      <div className="flex h-16 items-center justify-center gap-3 px-4 lg:justify-start">
        <Logo tone="dark" />
        <span className="hidden text-sm font-semibold leading-tight tracking-tight text-white lg:block">
          Gestión de Nacimientos
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2 lg:px-3" aria-label="Principal">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            aria-label={item.label}
            className={({ isActive }) =>
              cx(
                'flex h-10 items-center justify-center gap-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 lg:justify-start lg:px-3',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-sidebar-muted hover:bg-white/5 hover:text-white'
              )
            }
          >
            <item.icon size={18} />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2 lg:p-3">
        <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-3">
          <Avatar name={user.nombre} tone="dark" />
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-medium text-white">{user.nombre}</p>
            <p className="truncate text-xs text-sidebar-muted">{ROLES[user.rol]}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/60"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de usuario"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <Avatar name={user.nombre} size="md" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-line bg-surface p-2 shadow-pop"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.nombre}</p>
            <p className="truncate text-xs text-ink-subtle">{user.email}</p>
            <Badge tone="brand" className="mt-2">
              {ROLES[user.rol]}
            </Badge>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function TopBar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <Logo />
        <span className="truncate text-sm font-semibold tracking-tight text-ink">
          Gestión de Nacimientos
        </span>
      </div>
      <UserMenu user={user} onLogout={onLogout} />
    </header>
  )
}

function BottomNav({ items }) {
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-brand-700' : 'text-ink-subtle hover:text-ink'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const items = ITEMS.filter((i) => !i.roles || i.roles.includes(user.rol))

  return (
    <>
      <Sidebar items={items} user={user} onLogout={logout} />

      <div className="min-w-0 md:pl-16 lg:pl-60">
        <TopBar user={user} onLogout={logout} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-10 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <BottomNav items={items} />
    </>
  )
}
