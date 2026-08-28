import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, Heart, MapPin, Music, Paintbrush, Camera, BookOpen, Theater,
  Mic, Palette, Star, Award, Users, Tag, Filter, Eye, ChevronRight,
  Globe, Phone, ExternalLink, Sparkles
} from "lucide-react";
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

const CATEGORIA_ICON: Record<string, React.ReactNode> = {
  "Música": <Music size={14} />,
  "Artes Visuais": <Paintbrush size={14} />,
  "Fotografia": <Camera size={14} />,
  "Literatura": <BookOpen size={14} />,
  "Teatro": <Theater size={14} />,
  "Dança": <Mic size={14} />,
  "Artesanato": <Palette size={14} />,
};

interface Artista {
  id: number;
  nome: string;
  nome_artistico?: string;
  area_atuacao: string;
  bio: string;
  foto_url?: string;
  instagram?: string;
  site?: string;
  contato?: string;
  cidade?: string;
  tags?: string[];
  disponibilidade?: string[];
  status: string;
}

export default function Portal() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [favoritos, setFavoritos] = useState<number[]>([]);
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
    const nomeBusca = a.nome.toLowerCase().includes(busca.toLowerCase());
    const categoriaBusca = a.area_atuacao.toLowerCase().includes(busca.toLowerCase());
    const tagsBusca = (a.tags || []).some((t) => t.toLowerCase().includes(busca.toLowerCase()));
    const matchBusca = !busca || nomeBusca || categoriaBusca || tagsBusca;
    const matchCategoria = categoriaFiltro === "all" || a.area_atuacao === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  const featured = artistas[0] || null;
  const totalCategorias = new Set(artistas.map((a) => a.area_atuacao)).size;
  const totalCidades = new Set(artistas.map((a) => a.cidade || "Bagé")).size;

  const toggleFavorito = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritos((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  return (
    <div className="portal-page">
      {/* ─── Header ─── */}
      <header className="portal-header">
        <div className="container header-content">
          <div className="header-brand">
            <div className="brand-icon"><Star size={16} /></div>
            <div className="brand-text">
              <span className="brand-title">Cadastro Municipal</span>
              <span className="brand-subtitle">de Artistas</span>
            </div>
          </div>

          <nav className="header-nav-links">
            <Link to="/como-funciona" className="header-nav-item">Como funciona</Link>
          </nav>

          <div className="header-nav">
            <Link to="/cadastrar" className="btn btn-outline btn-sm">Sou artista</Link>
            <Link to="/admin/login" className="btn btn-primary btn-sm">Área administrativa</Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="portal-hero">
        <div className="hero-badge">
          <Award size={12} /> Plataforma oficial da Prefeitura de Bagé
        </div>
        <h1 className="hero-title">
          Descubra talentos<br />
          <span className="hero-title-highlight">da nossa cidade</span>
        </h1>
        <p className="hero-description">
          Encontre artistas locais por categoria, cidade e disponibilidade para o seu próximo evento.
        </p>

        <div className="hero-search">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, categoria ou palavra-chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">Buscar</button>
        </div>
      </section>

      {/* ─── Filtros ─── */}
      <section className="portal-filters">
        <div className="container">
          <div className="filters-scroll">
            <Filter size={16} className="filters-icon" />
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaFiltro(cat.value)}
                  className={`filter-btn ${categoriaFiltro === cat.value ? "filter-btn-active" : ""}`}
                >
                  {<Icon size={14} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Catálogo ─── */}
      <main className="portal-catalog">
        <div className="container">
          <div className="catalog-layout">
            <div className="catalog-main">
              <div className="catalog-topbar">
                <p className="catalog-count">
                  <span className="catalog-count-number">{filtered.length}</span> artistas encontrados
                </p>
                <button className="catalog-sort">Relevância <ChevronRight size={14} /></button>
              </div>

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
                          <div className="artist-card-placeholder"><Users size={40} /></div>
                        )}
                        <button
                          onClick={(e) => toggleFavorito(artista.id, e)}
                          className={`artist-fav ${favoritos.includes(artista.id) ? "artist-fav-active" : ""}`}
                          aria-label="Favoritar"
                        >
                          <Heart size={15} />
                        </button>
                        <span className="artist-status-badge">
                          <span className="status-dot" /> Disponível
                        </span>
                      </div>
                      <div className="artist-card-body">
                        <div className="artist-card-head">
                          <h3 className="artist-card-name">{artista.nome_artistico || artista.nome}</h3>
                        </div>
                        <div className="artist-card-meta">
                          <span className="artist-cat-badge">
                            {CATEGORIA_ICON[artista.area_atuacao] || <Star size={14} />}
                            {artista.area_atuacao}
                          </span>
                          <span className="artist-city">
                            <MapPin size={11} /> {artista.cidade || "Bagé"}
                          </span>
                        </div>
                        <p className="artist-card-bio">{artista.bio || "Artista local de Bagé."}</p>
                        <button className="artist-card-cta">
                          <Eye size={14} /> Ver perfil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Sidebar ─── */}
            <aside className="catalog-sidebar">
              {featured && (
                <div className="featured-card">
                  <div className="featured-photo">
                    {featured.foto_url ? (
                      <img src={featured.foto_url} alt={featured.nome} />
                    ) : (
                      <div className="featured-placeholder"><Users size={36} /></div>
                    )}
                    <div className="featured-overlay" />
                    <span className="featured-badge"><Star size={11} /> Destaque</span>
                    <div className="featured-heading">
                      <p className="featured-name">{featured.nome_artistico || featured.nome}</p>
                      <p className="featured-sub">{featured.area_atuacao} · {featured.cidade || "Bagé"}</p>
                    </div>
                  </div>
                  <div className="featured-body">
                    <p className="featured-bio">{featured.bio || "Artista local de Bagé."}</p>
                    <div className="featured-stats">
                      <div className="featured-stat">
                        <p className="featured-stat-value">—</p>
                        <p className="featured-stat-label">Eventos</p>
                      </div>
                      <div className="featured-stat">
                        <p className="featured-stat-value">—</p>
                        <p className="featured-stat-label">Avaliação</p>
                      </div>
                    </div>
                    <button className="featured-cta" onClick={() => setSelectedArtista(featured)}>
                      Ver perfil completo
                    </button>
                  </div>
                </div>
              )}

              <div className="stats-card card">
                <h4 className="stats-title">Números da plataforma</h4>
                <div className="stat-row">
                  <span className="stat-row-label"><Users size={16} /> Artistas cadastrados</span>
                  <span className="stat-row-value">{artistas.length}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label"><Tag size={16} /> Categorias</span>
                  <span className="stat-row-value">{totalCategorias}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-row-label"><MapPin size={16} /> Cidades representadas</span>
                  <span className="stat-row-value">{totalCidades}</span>
                </div>
              </div>

              <div className="cta-card">
                <Mic size={24} />
                <h4>É artista?</h4>
                <p>Cadastre-se e apareça para contratantes e eventos na sua cidade.</p>
                <Link to="/cadastrar" className="cta-card-btn">
                  <Sparkles size={14} /> Fazer cadastro
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

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
              <span className="artist-cat-badge">
                {CATEGORIA_ICON[selectedArtista.area_atuacao] || <Star size={14} />}
                {selectedArtista.area_atuacao}
              </span>
              <h2>{selectedArtista.nome_artistico || selectedArtista.nome}</h2>
              {selectedArtista.cidade && <p className="modal-city"><MapPin size={14} /> {selectedArtista.cidade}</p>}
              {selectedArtista.tags && selectedArtista.tags.length > 0 && (
                <div className="modal-tags">
                  {selectedArtista.tags.map((t) => (
                    <span key={t} className="modal-tag">{t}</span>
                  ))}
                </div>
              )}
              {selectedArtista.disponibilidade && selectedArtista.disponibilidade.length > 0 && (
                <p className="modal-avail">
                  <span className="availability-label">Disponibilidade:</span>{" "}
                  {selectedArtista.disponibilidade.join(" · ")}
                </p>
              )}
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
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-icon brand-icon-sm"><Star size={13} /></div>
            <span>Cadastro Municipal de Artistas</span>
          </div>
          <p>© 2025 Prefeitura de Bagé · Secretaria de Cultura</p>
          <div className="footer-links">
            <button>Termos de uso</button>
            <button>Privacidade</button>
            <Link to="/feedback">Dar feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}