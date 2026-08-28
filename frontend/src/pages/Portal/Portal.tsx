import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Music, Paintbrush, Camera, BookOpen, Theater, Mic, Palette, MapPin, ChevronRight, Star, Users, Globe, Phone, ExternalLink } from "lucide-react";
import "./Portal.css";

const CATEGORIAS = [
  { label: "Todas", value: "all", icon: Star },
  { label: "Música", value: "Música", icon: Music },
  { label: "Artes Visuais", value: "Artes Visuais", icon: Paintbrush },
  { label: "Fotografia", value: "Fotografia", icon: Camera },
  { label: "Literatura", value: "Literatura", icon: BookOpen },
  { label: "Teatro", value: "Teatro", icon: Theater },
  { label: "Dança", value: "Dança", icon: Mic },
  { label: "Artesanato", value: "Artesanato", icon: Palette },
];

const CATEGORIA_COLORS: Record<string, string> = {
  "Música": "badge-purple",
  "Artes Visuais": "badge-amber",
  "Fotografia": "badge-teal",
  "Literatura": "badge-indigo",
  "Teatro": "badge-rose",
  "Dança": "badge-purple",
  "Artesanato": "badge-amber",
};

interface Artista {
  id: number;
  nome: string;
  area_atuacao: string;
  bio: string;
  foto_url?: string;
  instagram?: string;
  site?: string;
  contato?: string;
  cidade?: string;
  status: string;
}

export default function Portal() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedArtista, setSelectedArtista] = useState<Artista | null>(null);

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  useEffect(() => {
    fetch(`${API_URL}/artistas/aprovados`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArtistas(data);
        } else {
          setArtistas([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setArtistas([]);
        setLoading(false);
      });
  }, [API_URL]);

  const filtered = artistas.filter((a) => {
    const matchBusca = a.nome.toLowerCase().includes(busca.toLowerCase()) ||
      a.area_atuacao.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === "all" || a.area_atuacao === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  return (
    <div className="portal-page">
      {/* ─── Header ─── */}
      <header className="portal-header">
        <div className="container">
          <div className="header-content">
            <div className="header-brand">
              <div className="brand-icon"><Palette size={22} /></div>
              <div>
                <span className="brand-title">Artistas de Bagé</span>
                <span className="brand-subtitle">Cadastro Municipal de Cultura</span>
              </div>
            </div>
            <nav className="header-nav">
              <Link to="/cadastrar" className="btn btn-primary">
                <Star size={16} /> Cadastrar-se como Artista
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="portal-hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-eyebrow">
              <MapPin size={14} /> Bagé, Rio Grande do Sul
            </span>
            <h1 className="hero-title">
              Conheça os <span className="gradient-text">Talentos</span> da nossa cidade
            </h1>
            <p className="hero-description">
              Um catálogo vivo com artistas, artesãos e criadores culturais de Bagé.
              Explore portfólios, descubra novas expressões e conecte-se com a arte local.
            </p>
            <div className="hero-search">
              <div className="search-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Buscar artista ou categoria..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{artistas.length}</span>
                <span className="stat-label">Artistas Cadastrados</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">{CATEGORIAS.length - 1}</span>
                <span className="stat-label">Categorias</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-number">1</span>
                <span className="stat-label">Município</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-glow" />
      </section>

      {/* ─── Filtros ─── */}
      <section className="portal-filters">
        <div className="container">
          <div className="filters-scroll">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaFiltro(cat.value)}
                  className={`filter-btn ${categoriaFiltro === cat.value ? "filter-btn-active" : ""}`}
                >
                  <Icon size={15} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Catálogo / Mural ─── */}
      <section className="portal-catalog">
        <div className="container">
          {loading ? (
            <div className="catalog-loading">
              <div className="spinner" />
              <p>Carregando artistas...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="catalog-empty">
              <Palette size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
              <h3>Nenhum artista encontrado</h3>
              <p>Tente buscar por outro nome ou categoria.</p>
            </div>
          ) : (
            <div className="artists-grid">
              {filtered.map((artista) => (
                <div key={artista.id} className="artist-card card" onClick={() => setSelectedArtista(artista)}>
                  <div className="artist-card-photo">
                    {artista.foto_url ? (
                      <img src={artista.foto_url} alt={artista.nome} />
                    ) : (
                      <div className="artist-card-placeholder">
                        <Users size={40} />
                      </div>
                    )}
                    <span className={`badge ${CATEGORIA_COLORS[artista.area_atuacao] || "badge-purple"} artist-card-badge`}>
                      {artista.area_atuacao}
                    </span>
                  </div>
                  <div className="artist-card-body">
                    <h3 className="artist-card-name">{artista.nome}</h3>
                    <p className="artist-card-bio">{artista.bio || "Artista local de Bagé."}</p>
                    <div className="artist-card-links">
                      {artista.instagram && (
                        <a href={`https://instagram.com/${artista.instagram.replace("@", "")}`}
                          target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="artist-social-link">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {artista.site && (
                        <a href={artista.site} target="_blank" rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="artist-social-link">
                          <Globe size={14} />
                        </a>
                      )}
                      {artista.contato && (
                        <a href={`tel:${artista.contato}`}
                          onClick={(e) => e.stopPropagation()}
                          className="artist-social-link">
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                    <button className="artist-card-cta">
                      Ver portfólio <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA de Cadastro ─── */}
      <section className="portal-cta">
        <div className="container">
          <div className="cta-box">
            <div className="cta-content">
              <h2>Você é artista em Bagé?</h2>
              <p>Cadastre seu portfólio gratuitamente e apareça neste mural para toda a cidade!</p>
            </div>
            <Link to="/cadastrar" className="btn btn-primary">
              Fazer meu cadastro <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Modal Artista ─── */}
      {selectedArtista && (
        <div className="modal-overlay" onClick={() => setSelectedArtista(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedArtista(null)}>✕</button>
            <div className="modal-photo">
              {selectedArtista.foto_url ? (
                <img src={selectedArtista.foto_url} alt={selectedArtista.nome} />
              ) : (
                <div className="modal-placeholder"><Users size={60} /></div>
              )}
            </div>
            <div className="modal-info">
              <span className={`badge ${CATEGORIA_COLORS[selectedArtista.area_atuacao] || "badge-purple"}`}>
                {selectedArtista.area_atuacao}
              </span>
              <h2>{selectedArtista.nome}</h2>
              {selectedArtista.cidade && <p className="modal-city"><MapPin size={14} /> {selectedArtista.cidade}</p>}
              <p className="modal-bio">{selectedArtista.bio || "Artista local de Bagé."}</p>
              <div className="modal-links">
                {selectedArtista.instagram && (
                  <a href={`https://instagram.com/${selectedArtista.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <ExternalLink size={14} /> Instagram
                  </a>
                )}
                {selectedArtista.site && (
                  <a href={selectedArtista.site} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <Globe size={14} /> Site
                  </a>
                )}
                {selectedArtista.contato && (
                  <a href={`tel:${selectedArtista.contato}`} className="btn btn-secondary btn-sm">
                    <Phone size={14} /> Contato
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="portal-footer">
        <div className="container">
          <p>
            © 2026 Cadastro Municipal de Artistas · Bagé, RS · Projeto de Extensão UNIPAMPA ·{" "}
            <Link to="/feedback" className="footer-feedback-link">
              Deixe seu feedback
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
