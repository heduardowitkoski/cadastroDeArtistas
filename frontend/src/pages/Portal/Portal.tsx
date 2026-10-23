import { filterArtists } from "../../lib/catalogFilter";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, Heart, MapPin, Music, Paintbrush, Camera, BookOpen, Theater,
  Mic, Palette, Star, Award, Users, Tag, Filter, Eye, ChevronRight,
  Globe, Sparkles, User
} from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useFavorites } from "../../lib/useFavorites";
import { assetUrl } from "../../lib/mediaUrl";
import { API_URL } from "../../lib/apiConfig";
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
  const { ids: favoritos, toggle: toggleFavorite, persistent } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    fetch(`${API_URL}/artistas/aprovados`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Resposta inválida do catálogo");
        setArtistas(data);
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  const filtered = filterArtists(artistas, busca, categoriaFiltro);

  const featured = artistas[0] || null;
  const totalCategorias = new Set(artistas.map((a) => a.area_atuacao)).size;
  const totalCidades = new Set(artistas.map((a) => a.cidade || "Bagé")).size;

  const toggleFavorito = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
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

      {!persistent && <p role="status" className="container">O armazenamento está indisponível; seus favoritos valem só nesta visita.</p>}
      {/* ─── Catálogo ─── */}
      <main className="portal-catalog" id="main-content">
        <div className="container">
          <div className="catalog-layout">
            <div className="catalog-main">
              <div className="catalog-topbar">
                <p className="catalog-count" aria-live="polite" aria-atomic="true">
                  {loading ? "Carregando artistas..." : loadError ? "Catálogo indisponível" : <><span className="catalog-count-number">{filtered.length}</span> artistas encontrados</>}
                </p>
                <button className="catalog-sort" aria-label="Ordenar resultados">Relevância <ChevronRight size={14} aria-hidden="true" /></button>
              </div>

              {loading ? (
                <div className="catalog-loading" role="status" aria-live="polite" aria-label="Carregando artistas">
                  <div className="spinner" aria-hidden="true" />
                  <p>Carregando artistas...</p>
                </div>
              ) : loadError ? (
                <div className="catalog-empty" role="alert">
                  <h2>Não foi possível carregar o catálogo</h2>
                  <p>Tente atualizar a página em alguns instantes.</p>
                  <button className="btn btn-secondary" onClick={() => window.location.reload()}>Tentar novamente</button>
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
                      <article
                        className="artist-card card"
                      >
                        <div className="artist-card-photo">
                          {artista.foto_url ? (
                            <img src={assetUrl(artista.foto_url)} alt={`Foto de ${artista.nome_artistico || artista.nome}`} />
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
                          <Link to={`/artistas/${artista.id}`} className="artist-card-cta" aria-label={`Ver perfil de ${artista.nome_artistico || artista.nome} — ${artista.area_atuacao}`}>
                            <Eye size={14} aria-hidden="true" /> Ver perfil
                          </Link>
                        </div>
                      </article>
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
                      <img src={assetUrl(featured.foto_url)} alt={`Foto de ${featured.nome_artistico || featured.nome}`} />
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
                    <Link className="featured-cta" to={`/artistas/${featured.id}`}>
                      Ver perfil completo
                    </Link>
                  </div>
                </div>
              )}

              <div className="stats-card card">
                <h2 className="stats-title">Números da plataforma</h2>
                <dl>
                  <div className="stat-row">
                    <dt className="stat-row-label"><Users size={16} aria-hidden="true" /> Artistas cadastrados</dt>
                    <dd className="stat-row-value">{loading || loadError ? "—" : artistas.length}</dd>
                  </div>
                  <div className="stat-row">
                    <dt className="stat-row-label"><Tag size={16} aria-hidden="true" /> Categorias</dt>
                    <dd className="stat-row-value">{loading || loadError ? "—" : totalCategorias}</dd>
                  </div>
                  <div className="stat-row">
                    <dt className="stat-row-label"><MapPin size={16} aria-hidden="true" /> Cidades representadas</dt>
                    <dd className="stat-row-value">{loading || loadError ? "—" : totalCidades}</dd>
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

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}
