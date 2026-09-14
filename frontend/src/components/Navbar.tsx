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
        <Link to="/" className="header-brand" style={{ textDecoration: "none" }} aria-label="Cadastro Municipal de Artistas — Página inicial">
          <div className="brand-icon" aria-hidden="true">
            <Star size={16} aria-hidden="true" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Cadastro Municipal</span>
            <span className="brand-subtitle">de Artistas</span>
          </div>
        </Link>

        {/* Links Principais de Navegação */}
        <nav className="header-nav-links" aria-label="Navegação principal">
          <Link
            to="/"
            className={`header-nav-item ${isNavActive("/", "catalogo") ? "active" : ""}`}
            aria-current={isNavActive("/", "catalogo") ? "page" : undefined}
          >
            <Grid size={14} style={{ marginRight: 6 }} aria-hidden="true" /> Catálogo
          </Link>
          <Link
            to="/como-funciona"
            className={`header-nav-item ${isNavActive("/como-funciona", "como-funciona") ? "active" : ""}`}
            aria-current={isNavActive("/como-funciona", "como-funciona") ? "page" : undefined}
          >
            <HelpCircle size={14} style={{ marginRight: 6 }} aria-hidden="true" /> Como funciona
          </Link>
          <Link
            to="/feedback"
            className={`header-nav-item ${isNavActive("/feedback", "feedback") ? "active" : ""}`}
            aria-current={isNavActive("/feedback", "feedback") ? "page" : undefined}
          >
            <MessageSquareHeart size={14} style={{ marginRight: 6 }} aria-hidden="true" /> Feedback
          </Link>
        </nav>

        {/* Botões de Ação */}
        <div className="header-nav" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Botão de Login do Artista existente */}
          <Link
            to="/artista/login"
            className={`btn btn-outline btn-sm ${isNavActive("/artista/login", "login-artista") ? "active-nav-btn" : ""}`}
            aria-current={isNavActive("/artista/login", "login-artista") ? "page" : undefined}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <User size={14} aria-hidden="true" /> Entrar (Artista)
          </Link>

          {/* Botão de Novo Cadastro de Artista */}
          <Link
            to="/cadastrar"
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Sparkles size={14} aria-hidden="true" /> Sou artista
          </Link>

          {/* Botão de Acesso Administrativo do Conselho */}
          <Link
            to="/admin/login"
            className="btn btn-secondary btn-sm"
            aria-label="Acesso administrativo — Gestores do Conselho Municipal de Políticas Culturais"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.9 }}
          >
            <Building2 size={14} aria-hidden="true" /> Admin
          </Link>

          {/* Botão Menu Mobile */}
          <button
            id="mobile-menu-btn"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-drawer"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              padding: 4
            }}
          >
            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Drawer do Menu Mobile */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="mobile-menu-drawer" role="navigation" aria-label="Menu mobile">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-current={isNavActive("/", "catalogo") ? "page" : undefined}>
            <Grid size={16} aria-hidden="true" /> Catálogo de Artistas
          </Link>
          <Link to="/como-funciona" onClick={() => setMobileMenuOpen(false)} aria-current={isNavActive("/como-funciona", "como-funciona") ? "page" : undefined}>
            <HelpCircle size={16} aria-hidden="true" /> Como Funciona
          </Link>
          <Link to="/feedback" onClick={() => setMobileMenuOpen(false)} aria-current={isNavActive("/feedback", "feedback") ? "page" : undefined}>
            <MessageSquareHeart size={16} aria-hidden="true" /> Dar Feedback
          </Link>
          <div className="mobile-menu-divider" role="separator" />
          <Link to="/artista/login" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-highlight">
            <User size={16} aria-hidden="true" /> Já sou cadastrado (Entrar)
          </Link>
          <Link to="/cadastrar" onClick={() => setMobileMenuOpen(false)} className="mobile-menu-btn-primary">
            <Sparkles size={16} aria-hidden="true" /> Fazer novo cadastro
          </Link>
          <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--text-muted)", fontSize: 13 }}>
            <Building2 size={15} aria-hidden="true" /> Acesso Administrativo (Conselho)
          </Link>
        </div>
      )}
    </header>
  );
}
