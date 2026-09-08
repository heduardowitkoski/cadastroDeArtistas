import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Star, User, Sparkles, Building2, Menu, X, MessageSquareHeart, HelpCircle, Grid
} from "lucide-react";
import "../pages/Portal/Portal.css";

interface NavbarProps {
  activePage?: "catalogo" | "como-funciona" | "feedback" | "cadastro" | "login-artista" | "admin";
}

export function Navbar({ activePage }: NavbarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = location.pathname;

  const isNavActive = (path: string, pageKey?: string) => {
    if (activePage && pageKey === activePage) return true;
    return pathname === path;
  };

  return (
    <header className="portal-header">
      <div className="container header-content">
        {/* Marca / Logo */}
        <Link to="/" className="header-brand" style={{ textDecoration: "none" }}>
          <div className="brand-icon">
            <Star size={16} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Cadastro Municipal</span>
            <span className="brand-subtitle">de Artistas</span>
          </div>
        </Link>

        {/* Links Principais de Navegação */}
        <nav className="header-nav-links">
          <Link
            to="/"
            className={`header-nav-item ${isNavActive("/", "catalogo") ? "active" : ""}`}
          >
            <Grid size={14} style={{ marginRight: 6 }} /> Catálogo
          </Link>
          <Link
            to="/como-funciona"
            className={`header-nav-item ${isNavActive("/como-funciona", "como-funciona") ? "active" : ""}`}
          >
            <HelpCircle size={14} style={{ marginRight: 6 }} /> Como funciona
          </Link>
          <Link
            to="/feedback"
            className={`header-nav-item ${isNavActive("/feedback", "feedback") ? "active" : ""}`}
          >
            <MessageSquareHeart size={14} style={{ marginRight: 6 }} /> Feedback
          </Link>
        </nav>

        {/* Botões de Ação */}
        <div className="header-nav" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Botão de Login do Artista existente */}
          <Link
            to="/artista/login"
            className={`btn btn-outline btn-sm ${isNavActive("/artista/login", "login-artista") ? "active-nav-btn" : ""}`}
            title="Entrar na Área do Artista"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <User size={14} /> Entrar (Artista)
          </Link>

          {/* Botão de Novo Cadastro de Artista */}
          <Link
            to="/cadastrar"
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Sparkles size={14} /> Sou artista
          </Link>

          {/* Botão de Acesso Administrativo do Conselho */}
          <Link
            to="/admin/login"
            className="btn btn-secondary btn-sm"
            title="Acesso dos Gestores do Conselho Municipal de Políticas Culturais"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.9 }}
          >
            <Building2 size={14} /> Admin
          </Link>

          {/* Botão Menu Mobile */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              padding: 4
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Drawer do Menu Mobile */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <Grid size={16} /> Catálogo de Artistas
          </Link>
          <Link to="/como-funciona" onClick={() => setMobileMenuOpen(false)}>
            <HelpCircle size={16} /> Como Funciona
          </Link>
          <Link to="/feedback" onClick={() => setMobileMenuOpen(false)}>
            <MessageSquareHeart size={16} /> Dar Feedback
          </Link>
          <div className="mobile-menu-divider" />
          <Link to="/artista/login" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-highlight">
            <User size={16} /> Já sou cadastrado (Entrar)
          </Link>
          <Link to="/cadastrar" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-btn-primary">
            <Sparkles size={16} /> Fazer novo cadastro
          </Link>
          <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--text-muted)", fontSize: 13 }}>
            <Building2 size={15} /> Acesso Administrativo (Conselho)
          </Link>
        </div>
      )}
    </header>
  );
}
