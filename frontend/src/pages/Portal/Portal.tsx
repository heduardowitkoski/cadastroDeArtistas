import { filterArtists } from "../../lib/catalogFilter";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search, Heart, MapPin, Music, Paintbrush, Camera, BookOpen, Theater,
  Mic, Palette, Star, Users, Eye, ChevronDown,
  Globe, Sparkles, Grid, ArrowRight
} from "lucide-react";
import { Footer } from "../../components/Footer";
import { useFavorites } from "../../lib/useFavorites";
import { assetUrl } from "../../lib/mediaUrl";
import { API_URL } from "../../lib/apiConfig";
import { useLocation } from "react-router-dom";
import "./Portal.css";
import "./CatalogLanding.css";

const CATEGORIAS = [
  { label: "Todos", value: "all", icon: Grid },
  { label: "Música", value: "Música", icon: Music },
  { label: "Artes Cênicas", value: "Artes Cênicas", icon: Theater },
  { label: "Artes Visuais", value: "Artes Visuais", icon: Palette },
  { label: "Artesanato", value: "Artesanato", icon: Paintbrush },
  { label: "Literatura", value: "Literatura", icon: BookOpen },
  { label: "Audiovisual", value: "Audiovisual", icon: Camera },
  { label: "Culturas Populares", value: "Culturas Populares", icon: Users },
  { label: "Teatro", value: "Teatro", icon: Theater },
  { label: "Dança", value: "Dança", icon: Mic },
  { label: "Circo", value: "Circo", icon: Star },
  { label: "Memória & Patrimônio", value: "Memória", icon: Star },
  { label: "Museus", value: "Museus", icon: Star },
  { label: "Folclore & Tradição", value: "Folclore", icon: Sparkles },
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
  const { hash } = useLocation();
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [maisCategorias, setMaisCategorias] = useState(false);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const catalogHeading = useRef<HTMLHeadingElement>(null);
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

  useEffect(() => {
    if (hash !== "#busca-artistas") return;
    searchInput.current?.focus({ preventScroll: true });
    searchInput.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [hash]);

  const filtered = filterArtists(artistas, busca, categoriaFiltro);

  const totalCategorias = new Set(artistas.flatMap((a) => a.area_atuacao?.split(",").map((area) => area.trim().toLocaleLowerCase("pt-BR")) ?? []).filter(Boolean)).size;
  const totalCidades = new Set(artistas.map((a) => a.cidade || "Bagé")).size;
  const statsUnavailable = loading || loadError;

  const toggleFavorito = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };





  const focusResults = () => {
    setShowAllArtists(true);
    catalogHeading.current?.focus({ preventScroll: true });
    catalogHeading.current?.scrollIntoView({ block: "start" });
  };
  const renderCategory = ({ label, value, icon: Icon }: (typeof CATEGORIAS)[number]) => (
    <button
      key={value}
      type="button"
      onClick={() => setCategoriaFiltro(value)}
      className="catalog-category"
      aria-pressed={categoriaFiltro === value}
      aria-label={`Filtrar por: ${label}`}
    >
      <Icon size={15} aria-hidden="true" /> {label}
    </button>
  );

  return (
    <div className="portal-page catalog-page">
      <main id="main-content">
        <section className="catalog-hero" aria-labelledby="catalog-hero-title">
          <div className="catalog-hero-art" aria-hidden="true">
            <img src="/bage-catalog-hero.webp" alt="" width={1920} height={640} fetchPriority="high" />
          </div>
          <div className="container catalog-hero-inner">
            <div className="catalog-hero-copy">
              <p className="catalog-kicker">Arte que movimenta Bagé</p>
              <h1 id="catalog-hero-title">Descubra o talento<br />da <span>nossa cidade</span></h1>
              <p className="catalog-intro">Conheça artistas de Bagé, explore suas obras, contrate para eventos e fortaleça a cultura local.</p>
              <form className="catalog-search" role="search" onSubmit={(event) => { event.preventDefault(); focusResults(); }}>
                <Search size={21} aria-hidden="true" />
                <input
                  ref={searchInput}
                  id="busca-artistas"
                  type="search"
                  placeholder="Buscar por nome, categoria ou palavra-chave..."
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  aria-label="Buscar artistas por nome, categoria ou palavra-chave"
                  autoComplete="off"
                />
                <button type="submit">Buscar</button>
              </form>
            </div>
            <aside className="catalog-hero-stats" aria-label="O catálogo em números">
              <dl>
                <div className="catalog-metric">
                  <span className="catalog-metric-icon" aria-hidden="true"><Users size={20} /></span>
                  <dt>Artistas no catálogo</dt>
                  <dd>{statsUnavailable ? "—" : artistas.length}</dd>
                </div>
                <div className="catalog-metric">
                  <span className="catalog-metric-icon catalog-metric-icon--green" aria-hidden="true"><Music size={20} /></span>
                  <dt>Categorias representadas</dt>
                  <dd>{statsUnavailable ? "—" : totalCategorias}</dd>
                </div>
                <div className="catalog-metric">
                  <span className="catalog-metric-icon catalog-metric-icon--orange" aria-hidden="true"><MapPin size={20} /></span>
                  <dt>Cidades representadas</dt>
                  <dd>{statsUnavailable ? "—" : totalCidades}</dd>
                </div>
              </dl>
              <div className="catalog-metric catalog-metric--message">
                <span className="catalog-metric-icon catalog-metric-icon--red" aria-hidden="true"><Heart size={20} fill="currentColor" /></span>
                <strong>Uma cidade</strong>
                <p>mais viva através da arte</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="container catalog-categories" aria-label="Filtrar artistas por categoria">
          <div className="catalog-categories-primary">
            {CATEGORIAS.slice(0, 8).map(renderCategory)}
            <button type="button" className="catalog-more" aria-expanded={maisCategorias} aria-controls="catalog-more-categories" onClick={() => setMaisCategorias(!maisCategorias)}>
              {maisCategorias ? "Menos categorias" : "Mais categorias"} <ChevronDown size={14} aria-hidden="true" />
            </button>
          </div>
          <div id="catalog-more-categories" className="catalog-categories-extra" hidden={!maisCategorias}>
            {CATEGORIAS.slice(8).map(renderCategory)}
          </div>
          {!maisCategorias && CATEGORIAS.slice(8).some(({ value }) => value === categoriaFiltro) && (
            <p className="catalog-hidden-filter">Filtro ativo: {CATEGORIAS.find(({ value }) => value === categoriaFiltro)?.label}</p>
          )}
        </section>

      {!persistent && <p role="status" className="container">O armazenamento está indisponível; seus favoritos valem só nesta visita.</p>}
      {/* ─── Catálogo ─── */}
      <section className={`portal-catalog ${showAllArtists ? "portal-catalog--all" : "portal-catalog--spotlight"}`} aria-labelledby="catalog-results">
        <div className="container">
          <div className="catalog-intro-row">
            <div>
              <h2 id="catalog-results" ref={catalogHeading} tabIndex={-1}>
                {showAllArtists ? "Artistas do catálogo" : busca.trim() ? "Resultados da busca" : categoriaFiltro !== "all" ? `Destaques em ${CATEGORIAS.find(({ value }) => value === categoriaFiltro)?.label}` : "Artistas em destaque"}
              </h2>
              <p>Conheça alguns dos talentos que fazem a cultura de Bagé acontecer.</p>
            </div>
            {!showAllArtists && <button type="button" className="catalog-view-all" onClick={() => { setBusca(""); setCategoriaFiltro("all"); focusResults(); }}>
              Ver todos os artistas <ArrowRight size={15} aria-hidden="true" />
            </button>}
          </div>
          <div className="catalog-main">
              {showAllArtists && <div className="catalog-topbar">
                <p className="catalog-count" aria-live="polite" aria-atomic="true">
                  {loading ? "Carregando artistas..." : loadError ? "Catálogo indisponível" : <><span className="catalog-count-number">{filtered.length}</span> {filtered.length === 1 ? "artista encontrado" : "artistas encontrados"}</>}
                </p>
              </div>}

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
                showAllArtists ? <ul className="artists-grid" aria-label="Lista de artistas">
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
                            <span className={`artist-cat-badge ${getSpotlightCategoryColor(artista.area_atuacao)}`} aria-label={`Categoria: ${artista.area_atuacao}`}>
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
                </ul> : <ul className="spotlight-grid" aria-label="Artistas em destaque">
                  {filtered.slice(0, 5).map((artista) => (
                    <li key={artista.id}>
                      <article className="spotlight-card">
                        <div className="spotlight-media">
                          <div className="spotlight-image">
                            {artista.foto_url ? (
                              <img src={assetUrl(artista.foto_url)} alt={`Foto de ${artista.nome_artistico || artista.nome}`} />
                            ) : (
                              <div className="artist-card-placeholder" aria-hidden="true"><Users size={40} aria-hidden="true" /></div>
                            )}
                          </div>
                          <button
                            onClick={(e) => toggleFavorito(artista.id, e)}
                            className={`artist-fav spotlight-fav ${favoritos.includes(artista.id) ? "artist-fav-active" : ""}`}
                            aria-label={favoritos.includes(artista.id) ? `Desfavoritar ${artista.nome_artistico || artista.nome}` : `Favoritar ${artista.nome_artistico || artista.nome}`}
                            aria-pressed={favoritos.includes(artista.id)}
                          >
                            <Heart size={15} aria-hidden="true" />
                          </button>
                          <span className="spotlight-status"><span className="status-dot" aria-hidden="true" />Disponível</span>
                          <span className={`spotlight-category ${getSpotlightCategoryColor(artista.area_atuacao)}`}>
                            {CATEGORIA_ICON[artista.area_atuacao] || <Star size={13} aria-hidden="true" />}
                            {artista.area_atuacao}
                          </span>
                        </div>
                        <div className="spotlight-body">
                          <h3 className="spotlight-name">{artista.nome_artistico || artista.nome}</h3>
                          <p className="spotlight-city"><MapPin size={12} aria-hidden="true" />{artista.cidade || "Bagé"}, RS</p>
                          <p className="spotlight-bio">{artista.bio || "Artista local de Bagé."}</p>
                          <Link to={`/artistas/${artista.id}`} className="spotlight-cta" aria-label={`Ver perfil de ${artista.nome_artistico || artista.nome}`}>
                            Ver perfil <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      </section>
      </main>

      {/* ─── Footer ─── */}
      <Footer catalogTheme />
    </div>
  );
}

function getSpotlightCategoryColor(category: string) {
  const normalized = category.toLocaleLowerCase("pt-BR");
  if (normalized.includes("música")) return "spotlight-category--blue";
  if (normalized.includes("dança") || normalized.includes("teatro") || normalized.includes("circo")) return "spotlight-category--coral";
  if (normalized.includes("artes visuais")) return "spotlight-category--green";
  if (normalized.includes("artesanato")) return "spotlight-category--ochre";
  return "spotlight-category--slate";
}
