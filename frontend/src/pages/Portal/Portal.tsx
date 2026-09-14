import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search, Heart, MapPin, Music, Paintbrush, Camera, BookOpen, Theater,
  Mic, Palette, Star, Award, Users, Tag, Filter, Eye, ChevronRight,
  Globe, Phone, ExternalLink, Sparkles, User, X
} from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import "./Portal.css";

const CATEGORIAS = [
  { label: "Todas", value: "all", icon: Star },
  { label: "Teatro", value: "Teatro", icon: Theater },
  { label: "Dança", value: "Dança", icon: Mic },
  { label: "Circo", value: "Circo", icon: Star },
  { label: "Artes Visuais", value: "Artes Visuais", icon: Paintbrush },
  { label: "Artesanato", value: "Artesanato", icon: Palette },
  { label: "Audiovisual", value: "Audiovisual", icon: Camera },
  { label: "Música", value: "Música", icon: Music },
  { label: "Literatura", value: "Literatura", icon: BookOpen },
  { label: "Memória & Patrimônio", value: "Memória", icon: Star },
  { label: "Museus", value: "Museus", icon: Star },
  { label: "Folclore & Tradição", value: "Folclore", icon: Sparkles },
  { label: "Culturas Populares", value: "Culturas Populares", icon: Users },
  { label: "Carnaval", value: "Carnaval", icon: Sparkles },
  { label: "Diversidade Linguística", value: "Linguística", icon: Globe },
];

const CATEGORIA_ICON: Record<string, React.ReactNode> = {
  "Teatro": <Theater size={14} aria-hidden="true" />,
  "Dança": <Mic size={14} aria-hidden="true" />,
  "Circo": <Star size={14} aria-hidden="true" />,
  "Artes Visuais": <Paintbrush size={14} aria-hidden="true" />,
  "Artesanato": <Palette size={14} aria-hidden="true" />,
  "Audiovisual": <Camera size={14} aria-hidden="true" />,
  "Música": <Music size={14} aria-hidden="true" />,
  "Leitura, Livro e Literatura": <BookOpen size={14} aria-hidden="true" />,
  "Literatura": <BookOpen size={14} aria-hidden="true" />,
  "Memória e Patrimônio": <Star size={14} aria-hidden="true" />,
  "Museus": <Star size={14} aria-hidden="true" />,
  "Folclore e Tradição Gaúcha": <Sparkles size={14} aria-hidden="true" />,
  "Culturas Populares": <Users size={14} aria-hidden="true" />,
  "Carnaval": <Sparkles size={14} aria-hidden="true" />,
  "Diversidade Linguística": <Globe size={14} aria-hidden="true" />,
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
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const modalHeadingId = "modal-artista-titulo";

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

  // Foco automático no botão de fechar ao abrir o modal
  useEffect(() => {
    if (selectedArtista && modalCloseRef.current) {
      modalCloseRef.current.focus();
    }
  }, [selectedArtista]);

  // Fechar modal com Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedArtista) {
        setSelectedArtista(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedArtista]);

  // Armadilha de foco no modal (focus trap)
  useEffect(() => {
    if (!selectedArtista) return;
    const modal = document.getElementById("modal-artista-card");
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [selectedArtista]);

  const filtered = artistas.filter((a) => {
    const areaStr = (a.area_atuacao || "").toLowerCase();
    const nomeBusca = a.nome.toLowerCase().includes(busca.toLowerCase());
    const categoriaBusca = areaStr.includes(busca.toLowerCase());
    const tagsBusca = (a.tags || []).some((t) => t.toLowerCase().includes(busca.toLowerCase()));
    const matchBusca = !busca || nomeBusca || categoriaBusca || tagsBusca;
    const matchCategoria = categoriaFiltro === "all" || areaStr.includes(categoriaFiltro.toLowerCase());
    return matchBusca && matchCategoria;
  });

  const featured = artistas[0] || null;
  const totalCategorias = new Set(artistas.map((a) => a.area_atuacao)).size;
  const totalCidades = new Set(artistas.map((a) => a.cidade || "Bagé")).size;

  const toggleFavorito = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoritos((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  };

  const abrirPerfil = (artista: Artista) => setSelectedArtista(artista);

  const handleCardKeyDown = (e: React.KeyboardEvent, artista: Artista) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirPerfil(artista);
    }
  };

  return (
    <div className="portal-page">
      {/* ─── Header ─── */}
      <Navbar activePage="catalogo" />

      {/* ─── Hero ─── */}
      <section className="portal-hero" aria-label="Apresentação do catálogo de artistas">
        <div className="hero-badge" aria-hidden="true">
          <Award size={12} aria-hidden="true" /> Plataforma oficial dos Gestores do Conselho Municipal de Políticas Culturais
        </div>
        <h1 className="hero-title">
          Descubra talentos<br />
          <span className="hero-title-highlight">da nossa cidade</span>
        </h1>
        <p className="hero-description">
          Encontre artistas locais por categoria, cidade e disponibilidade para o seu próximo evento.
        </p>

        <div className="hero-search" role="search" style={{ marginBottom: 24 }}>
          <Search className="search-icon" size={20} aria-hidden="true" />
          <input
            id="busca-artistas"
            type="search"
            placeholder="Buscar por nome, categoria ou palavra-chave..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="search-input"
            aria-label="Buscar artistas por nome, categoria ou palavra-chave"
            autoComplete="off"
          />
          <button className="search-btn" aria-label="Executar busca">Buscar</button>
        </div>
        
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link to="/cadastrar" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} aria-hidden="true" /> Fazer Cadastro
          </Link>
          <Link to="/artista/login" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderColor: "rgba(196,181,253,0.4)", color: "#DDD6FE", background: "rgba(255,255,255,0.05)" }}>
            <User size={16} aria-hidden="true" /> Já sou cadastrado (Entrar)
          </Link>
        </div>
      </section>

      {/* ─── Filtros ─── */}
      <section className="portal-filters" aria-label="Filtrar artistas por categoria">
        <div className="container">
          <div className="filters-scroll" role="group" aria-label="Categorias para filtrar">
            <Filter size={16} className="filters-icon" aria-hidden="true" />
            {CATEGORIAS.map((cat) => {
              const Icon = cat.icon;
              const isActive = categoriaFiltro === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategoriaFiltro(cat.value)}
                  className={`filter-btn ${isActive ? "filter-btn-active" : ""}`}
                  aria-pressed={isActive}
                  aria-label={`Filtrar por: ${cat.label}`}
                >
                  {<Icon size={14} aria-hidden="true" />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Catálogo ─── */}
      <main className="portal-catalog" id="main-content">
        <div className="container">
          <div className="catalog-layout">
            <div className="catalog-main">
              <div className="catalog-topbar">
                <p className="catalog-count" aria-live="polite" aria-atomic="true">
                  <span className="catalog-count-number">{filtered.length}</span> artistas encontrados
                </p>
                <button className="catalog-sort" aria-label="Ordenar resultados">Relevância <ChevronRight size={14} aria-hidden="true" /></button>
              </div>

              {loading ? (
                <div className="catalog-loading" role="status" aria-live="polite" aria-label="Carregando artistas">
                  <div className="spinner" aria-hidden="true" />
                  <p>Carregando artistas...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="catalog-empty" role="status">
                  <Palette size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} aria-hidden="true" />
                  <h2>Nenhum artista encontrado</h2>
                  <p>Tente buscar por outro nome ou categoria.</p>
                </div>
              ) : (
                <ul className="artists-grid" aria-label="Lista de artistas">
                  {filtered.map((artista) => (
                    <li key={artista.id} style={{ listStyle: "none" }}>
                      <div
                        className="artist-card card"
                        role="button"
                        tabIndex={0}
                        onClick={() => abrirPerfil(artista)}
                        onKeyDown={(e) => handleCardKeyDown(e, artista)}
                        aria-label={`Ver perfil de ${artista.nome_artistico || artista.nome} — ${artista.area_atuacao}`}
                      >
                        <div className="artist-card-photo">
                          {artista.foto_url ? (
                            <img src={artista.foto_url} alt={`Foto de ${artista.nome_artistico || artista.nome}`} />
                          ) : (
                            <div className="artist-card-placeholder" aria-hidden="true"><Users size={40} aria-hidden="true" /></div>
                          )}
                          <button
                            onClick={(e) => toggleFavorito(artista.id, e)}
                            className={`artist-fav ${favoritos.includes(artista.id) ? "artist-fav-active" : ""}`}
                            aria-label={favoritos.includes(artista.id) ? `Desfavoritar ${artista.nome_artistico || artista.nome}` : `Favoritar ${artista.nome_artistico || artista.nome}`}
                            aria-pressed={favoritos.includes(artista.id)}
                          >
                            <Heart size={15} aria-hidden="true" />
                          </button>
                          <span className="artist-status-badge" aria-label="Status: Disponível">
                            <span className="status-dot" aria-hidden="true" /> Disponível
                          </span>
                        </div>
                        <div className="artist-card-body">
                          <div className="artist-card-head">
                            <h3 className="artist-card-name">{artista.nome_artistico || artista.nome}</h3>
                          </div>
                          <div className="artist-card-meta">
                            <span className="artist-cat-badge" aria-label={`Categoria: ${artista.area_atuacao}`}>
                              {CATEGORIA_ICON[artista.area_atuacao] || <Star size={14} aria-hidden="true" />}
                              {artista.area_atuacao}
                            </span>
                            <span className="artist-city">
                              <MapPin size={11} aria-hidden="true" /> {artista.cidade || "Bagé"}
                            </span>
                          </div>
                          <p className="artist-card-bio">{artista.bio || "Artista local de Bagé."}</p>
                          <div className="artist-card-cta" aria-hidden="true">
                            <Eye size={14} aria-hidden="true" /> Ver perfil
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ─── Sidebar ─── */}
            <aside className="catalog-sidebar" aria-label="Informações laterais">
              {featured && (
                <div className="featured-card">
                  <div className="featured-photo">
                    {featured.foto_url ? (
                      <img src={featured.foto_url} alt={`Foto de ${featured.nome_artistico || featured.nome}`} />
                    ) : (
                      <div className="featured-placeholder" aria-hidden="true"><Users size={36} aria-hidden="true" /></div>
                    )}
                    <div className="featured-overlay" aria-hidden="true" />
                    <span className="featured-badge" aria-label="Artista em destaque">
                      <Star size={11} aria-hidden="true" /> Destaque
                    </span>
                    <div className="featured-heading">
                      <p className="featured-name">{featured.nome_artistico || featured.nome}</p>
                      <p className="featured-sub">{featured.area_atuacao} · {featured.cidade || "Bagé"}</p>
                    </div>
                  </div>
                  <div className="featured-body">
                    <p className="featured-bio">{featured.bio || "Artista local de Bagé."}</p>
                    <div className="featured-stats" aria-hidden="true">
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
                <h2 className="stats-title">Números da plataforma</h2>
                <dl>
                  <div className="stat-row">
                    <dt className="stat-row-label"><Users size={16} aria-hidden="true" /> Artistas cadastrados</dt>
                    <dd className="stat-row-value">{artistas.length}</dd>
                  </div>
                  <div className="stat-row">
                    <dt className="stat-row-label"><Tag size={16} aria-hidden="true" /> Categorias</dt>
                    <dd className="stat-row-value">{totalCategorias}</dd>
                  </div>
                  <div className="stat-row">
                    <dt className="stat-row-label"><MapPin size={16} aria-hidden="true" /> Cidades representadas</dt>
                    <dd className="stat-row-value">{totalCidades}</dd>
                  </div>
                </dl>
              </div>

              <div className="cta-card">
                <Mic size={24} aria-hidden="true" />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#7C2D12", marginBottom: 4 }}>É artista?</h2>
                <p>Cadastre-se e apareça para contratantes e eventos na sua cidade.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 8 }}>
                  <Link to="/cadastrar" className="cta-card-btn" style={{ width: "100%", justifyContent: "center" }}>
                    <Sparkles size={14} aria-hidden="true" /> Fazer cadastro
                  </Link>
                  <Link to="/artista/login" className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                    <User size={14} aria-hidden="true" /> Já sou cadastrado (Entrar)
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ─── Modal Artista ─── */}
      {selectedArtista && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedArtista(null)}
          role="presentation"
          aria-hidden="false"
        >
          <div
            id="modal-artista-card"
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalHeadingId}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={modalCloseRef}
              className="modal-close"
              onClick={() => setSelectedArtista(null)}
              aria-label="Fechar perfil do artista"
            >
              <X size={14} aria-hidden="true" />
            </button>
            <div className="modal-photo">
              {selectedArtista.foto_url ? (
                <img src={selectedArtista.foto_url} alt={`Foto de ${selectedArtista.nome_artistico || selectedArtista.nome}`} />
              ) : (
                <div className="modal-placeholder" aria-hidden="true"><Users size={60} aria-hidden="true" /></div>
              )}
            </div>
            <div className="modal-info">
              <span className="artist-cat-badge" aria-label={`Categoria: ${selectedArtista.area_atuacao}`}>
                {CATEGORIA_ICON[selectedArtista.area_atuacao] || <Star size={14} aria-hidden="true" />}
                {selectedArtista.area_atuacao}
              </span>
              <h2 id={modalHeadingId}>{selectedArtista.nome_artistico || selectedArtista.nome}</h2>
              {selectedArtista.cidade && (
                <p className="modal-city">
                  <MapPin size={14} aria-hidden="true" /> {selectedArtista.cidade}
                </p>
              )}
              {selectedArtista.tags && selectedArtista.tags.length > 0 && (
                <div className="modal-tags" aria-label="Palavras-chave do artista">
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
                  <a
                    href={`https://instagram.com/${selectedArtista.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-secondary btn-sm"
                    aria-label={`Instagram de ${selectedArtista.nome_artistico || selectedArtista.nome} (abre em nova aba)`}
                  >
                    <ExternalLink size={14} aria-hidden="true" /> Instagram
                  </a>
                )}
                {selectedArtista.site && (
                  <a
                    href={selectedArtista.site}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-secondary btn-sm"
                    aria-label={`Site de ${selectedArtista.nome_artistico || selectedArtista.nome} (abre em nova aba)`}
                  >
                    <Globe size={14} aria-hidden="true" /> Site
                  </a>
                )}
                {selectedArtista.contato && (
                  <a
                    href={`tel:${selectedArtista.contato}`}
                    className="btn btn-secondary btn-sm"
                    aria-label={`Ligar para ${selectedArtista.nome_artistico || selectedArtista.nome}`}
                  >
                    <Phone size={14} aria-hidden="true" /> Contato
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}