import { Link } from "react-router-dom";
import { Star, User, Sparkles, Building2, MessageSquareHeart, Grid, HelpCircle } from "lucide-react";
import "../pages/Portal/Portal.css";

export function Footer() {
  return (
    <footer className="portal-footer" style={{ background: "var(--navy)", color: "#C4B5FD", paddingTop: 40, paddingBottom: 32 }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32, marginBottom: 32 }}>
          {/* Coluna 1: Marca & Info */}
          <div>
            <div className="footer-brand" style={{ marginBottom: 12 }}>
              <div className="brand-icon brand-icon-sm">
                <Star size={14} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#EDE9FE" }}>Cadastro de Artistas</span>
            </div>
            <p style={{ fontSize: 13, color: "#A78BFA", lineHeight: 1.6, margin: 0 }}>
              Plataforma oficial da Prefeitura Municipal de Bagé para mapeamento, valorização e contratação da cultura local.
            </p>
          </div>

          {/* Coluna 2: Para Artistas */}
          <div>
            <h4 style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Para Artistas
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/artista/login" style={{ color: "#C4B5FD", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <User size={13} /> Entrar na Área do Artista (Login)
                </Link>
              </li>
              <li>
                <Link to="/cadastrar" style={{ color: "#C4B5FD", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={13} /> Criar perfil de artista
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" style={{ color: "#C4B5FD", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <HelpCircle size={13} /> Como funciona o cadastro
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Para Cidadãos & Secretaria */}
          <div>
            <h4 style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Navegação Geral
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li>
                <Link to="/" style={{ color: "#C4B5FD", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Grid size={13} /> Catálogo de Artistas
                </Link>
              </li>
              <li>
                <Link to="/feedback" style={{ color: "#C4B5FD", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MessageSquareHeart size={13} /> Dar feedback da plataforma
                </Link>
              </li>
              <li>
                <Link to="/admin/login" style={{ color: "#C4B5FD", textDecoration: "none", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Building2 size={13} /> Painel Administrativo (Secretaria)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(196,181,253,0.15)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#A78BFA", margin: 0 }}>
            © 2026 Prefeitura de Bagé · Secretaria Municipal de Cultura
          </p>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <Link to="/" style={{ color: "#C4B5FD", textDecoration: "none" }}>Início</Link>
            <Link to="/como-funciona" style={{ color: "#C4B5FD", textDecoration: "none" }}>Ajuda</Link>
            <Link to="/feedback" style={{ color: "#C4B5FD", textDecoration: "none" }}>Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
