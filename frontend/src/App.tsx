import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Portal from './pages/Portal/Portal'
import CadastroArtista from './pages/Cadastro/CadastroArtista'
import Feedback from './pages/Feedback/Feedback'
import ComoFunciona from './pages/ComoFunciona/ComoFunciona'
import Login from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ArtistaLogin from './pages/Artista/ArtistaLogin'
import EditarCadastro from './pages/Artista/EditarCadastro'
import { PrivateRoute } from './components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/cadastrar" element={<CadastroArtista />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/artista/login" element={<ArtistaLogin />} />
        <Route path="/artista/editar" element={
          <PrivateRoute loginPath="/artista/login">
            <EditarCadastro />
          </PrivateRoute>
        } />
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