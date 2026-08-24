import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portal from './pages/Portal/Portal'
import CadastroArtista from './pages/Cadastro/CadastroArtista'
import Login from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/AdminDashboard'
import { PrivateRoute } from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/cadastrar" element={<CadastroArtista />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
