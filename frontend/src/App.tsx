import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Portal from './pages/Portal/Portal'
import CadastroArtista from './pages/Cadastro/CadastroArtista'
import Feedback from './pages/Feedback/Feedback'
import ComoFunciona from './pages/ComoFunciona/ComoFunciona'
import Login from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ArtistaLogin from './pages/Artista/ArtistaLogin'
import EdicaoIndisponivel from './pages/Artista/EdicaoIndisponivel'
import { PrivateRoute } from './components/PrivateRoute'
import { Navbar } from './components/Navbar'
import { lazy, Suspense } from 'react'
const ArtistProfile=lazy(()=>import('./pages/ArtistProfile/ArtistProfile'))

function AppRoutes() {
  const { pathname } = useLocation()
  const isCatalog = pathname === "/"
  const isMinimalHeader = ["/cadastrar", "/artista/login", "/artista/editar"].includes(pathname)
  const activePage = pathname === "/" ? "catalogo"
    : pathname === "/como-funciona" ? "como-funciona"
    : pathname === "/feedback" ? "feedback"
    : pathname === "/cadastrar" ? "cadastro"
    : pathname === "/artista/login" ? "login-artista"
    : pathname.startsWith("/admin") ? "admin"
    : undefined

  return (
    <>
      <Navbar
        activePage={activePage}
        showPublicLinks={!isMinimalHeader}
        showAccountActions={!isMinimalHeader}
        onCatalogSearch={isCatalog ? () => {
          const search = document.getElementById("busca-artistas") as HTMLInputElement | null
          search?.focus({ preventScroll: true })
          search?.scrollIntoView({ block: "center" })
        } : undefined}
      />
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/artistas/:id" element={<Suspense fallback={<main className="container" role="status">Carregando perfil do artista…</main>}><ArtistProfile /></Suspense>} />
        <Route path="/cadastrar" element={<CadastroArtista />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/artista/login" element={<ArtistaLogin />} />
        <Route path="/artista/editar" element={
          <PrivateRoute loginPath="/artista/login">
            <EdicaoIndisponivel />
          </PrivateRoute>
        } />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
