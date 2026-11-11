import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Births from './pages/Births'
import BirthDetail from './pages/BirthDetail'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/nacimientos" element={<Births />} />
          <Route path="/nacimientos/:id" element={<BirthDetail />} />
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}
