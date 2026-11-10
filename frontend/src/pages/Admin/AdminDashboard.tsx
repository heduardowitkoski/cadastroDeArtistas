import ArtistTools from './ArtistTools';
import { assetUrl } from '../../lib/mediaUrl';
import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { adminFetch } from "../../lib/adminApi";
import { useDialogFocus } from "../../lib/useDialogFocus";
import {
  CheckCircle, Clock, XCircle, LogOut, Star, Check, X, User,
  Pencil, Trash2, Save, AlertTriangle, MessageSquareHeart, Sparkles,
  LayoutGrid, BarChart3, CalendarDays, Menu, Search, SlidersHorizontal,
  MapPin, Mail, Phone, Globe, Link2 as LinkIcon, FileText, Image as ImageIcon,
  ExternalLink, ArrowUpDown, Bell, ChevronDown
} from "lucide-react";
import "./AdminDashboard.css";

interface Artista {
  id: number;
  nome: string;
  nome_artistico?: string;
  email: string;
  contato: string;
  cidade: string;
  area_atuacao: string;
  bio: string;
  foto_url?: string;
  instagram?: string;
  site?: string;
  tags?: string[];
  disponibilidade?: string[];
  status: string;
  created_at: string;
}

interface Feedback {
  id: number;
  nome?: string;
  email?: string;
  tipo: string;
  nota?: number;
  mensagem: string;
  created_at: string;
}

const CATEGORIAS = ["Música", "Artes Visuais", "Fotografia", "Literatura", "Teatro", "Dança", "Artesanato", "Circo", "Cinema", "Outra"];
const DISPONIBILIDADES = ["Fins de semana", "Dias úteis", "Feriados", "Eventos noturnos", "Eventos diurnos"];

const STATUS_BADGE: Record<string, string> = {
  Aprovado: "badge-teal",
  Pendente: "badge-amber",
  Rejeitado: "badge-rose",
};

const TIPO_BADGE: Record<string, string> = {
  Elogio: "badge-teal",
  Sugestão: "badge-indigo",
  Crítica: "badge-amber",
  Outro: "badge-purple",
};

function formatAge(createdAt: string) {
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return "Data indisponível";
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (days === 0) return "Hoje";
  if (days === 1) return "Há 1 dia";
  return `Há ${days} dias`;
}

function formatNotificationAge(createdAt: string) {
  const timestamp = new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) return "Data indisponível";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes === 0) return "Agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  const days = Math.floor(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}

type Tab = "Visão geral" | "Pendente" | "Aprovado" | "Rejeitado" | "Feedbacks";

export default function AdminDashboard() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingArtistas, setLoadingArtistas] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [artistasError, setArtistasError] = useState("");
  const [feedbacksError, setFeedbacksError] = useState("");
  const [actionError, setActionError] = useState("");
  const [tab, setTab] = useState<Tab>("Pendente");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const globalSearchRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const didAutoSelectPending = useRef(false);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingCategory, setPendingCategory] = useState("");
  const [pendingCity, setPendingCity] = useState("");
  const [pendingSort, setPendingSort] = useState<"recent" | "oldest" | "name">("recent");
  const [pendingAvailabilityOnly, setPendingAvailabilityOnly] = useState(false);
  const [pendingMoreFilters, setPendingMoreFilters] = useState(false);
  const [selectedArtista, setSelectedArtista] = useState<Artista | null>(null);
  const [selectedDrawerTab, setSelectedDrawerTab] = useState<"overview" | "portfolio" | "documents">("overview");

  const [editingArtista, setEditingArtista] = useState<Artista | null>(null);
  const [toolsArtist, setToolsArtist] = useState<Artista | null>(null);
  const [editForm, setEditForm] = useState<Partial<Artista>>({});
  const [editTagsText, setEditTagsText] = useState("");
  const [deletingArtista, setDeletingArtista] = useState<Artista | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<Feedback | null>(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const editDialogRef = useRef<HTMLDivElement>(null);
  const deleteArtistaRef = useRef<HTMLDivElement>(null);
  const deleteFeedbackRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();
  const fetchArtistas = async () => {
    setLoadingArtistas(true);
    setArtistasError("");
    try {
      const response = await adminFetch('/artistas');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Resposta inválida");
      setArtistas(data);
    } catch {
      setArtistasError("Não foi possível carregar os cadastros. Tente novamente.");
    } finally {
      setLoadingArtistas(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    setFeedbacksError("");
    try {
      const response = await adminFetch('/feedbacks');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Resposta inválida");
      setFeedbacks(data);
    } catch {
      setFeedbacksError("Não foi possível carregar os feedbacks. Tente novamente.");
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchArtistas();
    fetchFeedbacks();
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email || "";
      const metadataName = data.user?.user_metadata?.full_name;
      setAdminName(typeof metadataName === "string" && metadataName.trim() ? metadataName.trim() : email.split("@")[0]);
    }).catch(() => setAdminName(""));
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        globalSearchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  useEffect(() => {
    if (tab !== "Pendente" || loadingArtistas || didAutoSelectPending.current) return;
    didAutoSelectPending.current = true;
    setSelectedArtista(artistas.find((artist) => artist.status === "Pendente") || null);
  }, [artistas, loadingArtistas, tab]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!notificationsOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) setNotificationsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  useDialogFocus(Boolean(editingArtista), editDialogRef, () => { if (!submittingModal) setEditingArtista(null); });
  useDialogFocus(Boolean(deletingArtista), deleteArtistaRef, () => { if (!submittingModal) setDeletingArtista(null); });
  useDialogFocus(Boolean(deletingFeedback), deleteFeedbackRef, () => { if (!submittingModal) setDeletingFeedback(null); });

  useEffect(() => {
    if (!sidebarOpen) return;
    const menuButton = menuButtonRef.current;
    document.querySelector<HTMLElement>('.admin-sidebar .sidebar-nav-item')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      menuButton?.focus();
    };
  }, [sidebarOpen]);

  const handleStatus = async (artista: Artista, status: string) => {
    if (actionLoading !== null) return;
    setActionLoading(artista.id);
    setActionError("");
    try {
      const response = await adminFetch(`/artistas/${artista.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await fetchArtistas();
      setSelectedArtista((current) => current?.id === artista.id ? null : current);
    } catch {
      setActionError(`Não foi possível alterar o status de ${artista.nome}. Tente novamente.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEdit = (artista: Artista) => {
    setActionError("");
    setEditingArtista(artista);
    setEditForm({ ...artista });
    setEditTagsText((artista.tags || []).join(", "));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtista || submittingModal) return;
    setActionError("");
    setSubmittingModal(true);
    try {
      const res = await adminFetch(`/artistas/${editingArtista.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editForm.nome,
          nome_artistico: editForm.nome_artistico,
          email: editForm.email,
          contato: editForm.contato,
          cidade: editForm.cidade,
          area_atuacao: editForm.area_atuacao,
          bio: editForm.bio,
          foto_url: editForm.foto_url,
          instagram: editForm.instagram,
          site: editForm.site,
          disponibilidade: editForm.disponibilidade,
          status: editForm.status,
          tags: editTagsText.split(",").map((t) => t.trim()).filter(Boolean),
          forceStatus: true,
        }),
      });
      if (res.ok) {
        setEditingArtista(null);
        await fetchArtistas();
      } else {
        setActionError("Erro ao salvar alterações do artista. Tente novamente.");
      }
    } catch {
      setActionError("Erro de conexão ao atualizar artista. Tente novamente.");
    } finally {
      setSubmittingModal(false);
    }
  };

  const toggleEditDisponibilidade = (v: string) =>
    setEditForm((prev) => {
      const cur = (prev.disponibilidade || []) as string[];
      return {
        ...prev,
        disponibilidade: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v],
      };
    });

  const handleOpenDelete = (artista: Artista) => { setActionError(""); setDeletingArtista(artista); };
  const handleOpenDeleteFeedback = (feedback: Feedback) => { setActionError(""); setDeletingFeedback(feedback); };

  const handleConfirmDeleteFeedback = async () => {
    if (!deletingFeedback || submittingModal) return;
    setActionError("");
    setSubmittingModal(true);
    try {
      const res = await adminFetch(`/feedbacks/${deletingFeedback.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletingFeedback(null);
        await fetchFeedbacks();
      } else {
        setActionError("Erro ao excluir feedback. Tente novamente.");
      }
    } catch {
      setActionError("Erro de conexão ao excluir feedback. Tente novamente.");
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingArtista || submittingModal) return;
    setActionError("");
    setSubmittingModal(true);
    try {
      const res = await adminFetch(`/artistas/${deletingArtista.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeletingArtista(null);
        await fetchArtistas();
      } else {
        setActionError("Erro ao excluir artista. Tente novamente.");
      }
    } catch {
      setActionError("Erro de conexão ao excluir artista. Tente novamente.");
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const counts = {
    Pendente: artistas.filter((a) => a.status === "Pendente").length,
    Aprovado: artistas.filter((a) => a.status === "Aprovado").length,
    Rejeitado: artistas.filter((a) => a.status === "Rejeitado").length,
    Feedbacks: feedbacks.length,
  };
  const pendingNotifications = artistas
    .filter((artist) => artist.status === "Pendente")
    .sort((first, second) => new Date(first.created_at).getTime() - new Date(second.created_at).getTime());

  const normalizedGlobalSearch = globalSearch.trim().toLocaleLowerCase("pt-BR");
  const matchesArtistSearch = (artist: Artista) => !normalizedGlobalSearch ||
    [artist.nome, artist.nome_artistico, artist.email, artist.area_atuacao, artist.cidade, artist.bio]
      .some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedGlobalSearch));
  const filtered = tab === "Visão geral" || tab === "Feedbacks" ? [] : artistas
    .filter((artist) => artist.status === tab)
    .filter(matchesArtistSearch);
  const visibleFeedbacks = feedbacks.filter((feedback) => !normalizedGlobalSearch ||
    [feedback.nome, feedback.email, feedback.tipo, feedback.mensagem]
      .some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedGlobalSearch)));
  const pendingCategories = Array.from(new Set(artistas.filter((a) => a.status === "Pendente").flatMap((a) => a.area_atuacao.split(",").map((category) => category.trim()).filter(Boolean)))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const pendingCities = Array.from(new Set(artistas.filter((a) => a.status === "Pendente").map((a) => a.cidade.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const pendingFiltered = filtered
    .filter((artist) => {
      const query = pendingSearch.trim().toLocaleLowerCase("pt-BR");
      const matchesSearch = !query || [artist.nome, artist.nome_artistico, artist.email, artist.area_atuacao, artist.cidade, artist.bio].some((value) => value?.toLocaleLowerCase("pt-BR").includes(query));
      const matchesCategory = !pendingCategory || artist.area_atuacao.split(",").some((category) => category.trim() === pendingCategory);
      const matchesCity = !pendingCity || artist.cidade === pendingCity;
      const matchesAvailability = !pendingAvailabilityOnly || Boolean(artist.disponibilidade?.length);
      return matchesSearch && matchesCategory && matchesCity && matchesAvailability;
    })
    .sort((a, b) => pendingSort === "name"
      ? (a.nome_artistico || a.nome).localeCompare(b.nome_artistico || b.nome, "pt-BR")
      : pendingSort === "oldest"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    artistas.forEach((a) => map.set(a.area_atuacao || "Outra", (map.get(a.area_atuacao || "Outra") || 0) + 1));
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...sorted.map(([, n]) => n));
    return sorted.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }));
  }, [artistas]);

  const pendentesRecentes = artistas.filter((a) => a.status === "Pendente").slice(0, 3);
  const selectedArtistHasPhoto = Boolean(
    selectedArtista?.foto_url &&
    !(selectedArtista.foto_url.startsWith("/artistas/") && selectedArtista.status !== "Aprovado"),
  );
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const sidebarNav: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: "Visão geral", icon: <LayoutGrid size={18} />, label: "Visão geral" },
    { key: "Pendente", icon: <Clock size={18} />, label: "Pendentes" },
    { key: "Aprovado", icon: <CheckCircle size={18} />, label: "Aprovados" },
    { key: "Rejeitado", icon: <XCircle size={18} />, label: "Rejeitados" },
    { key: "Feedbacks", icon: <MessageSquareHeart size={18} />, label: "Feedbacks" },
  ];
  const runGlobalSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!normalizedGlobalSearch) {
      setTab("Pendente");
      setSidebarOpen(false);
      return;
    }
    const artistMatch = artistas.find(matchesArtistSearch);
    const feedbackMatch = visibleFeedbacks[0];
    if (feedbackMatch && (!artistMatch || new Date(feedbackMatch.created_at) > new Date(artistMatch.created_at))) {
      setTab("Feedbacks");
    } else {
      setTab((artistMatch?.status as Tab) || "Pendente");
      if (artistMatch?.status === "Pendente") setSelectedArtista(artistMatch);
    }
    setSidebarOpen(false);
  };

  return (
    <div className={`admin-page${tab === "Visão geral" ? " admin-page--overview" : ""}`}>
      <header className="admin-topbar">
        <button ref={menuButtonRef} className="admin-menu-toggle" type="button" aria-label={sidebarOpen ? "Fechar menu do painel" : "Abrir menu do painel"} aria-expanded={sidebarOpen} aria-controls="admin-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={20} aria-hidden="true" /></button>
        <form className={`admin-global-search${mobileSearchOpen ? " is-open" : ""}`} role="search" onSubmit={runGlobalSearch}>
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="admin-global-search">Buscar artista, e-mail, categoria ou palavra-chave</label>
          <input id="admin-global-search" ref={globalSearchRef} value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Buscar artista, e-mail, categoria ou palavra-chave..." />
          <kbd>Ctrl + K</kbd>
        </form>
        <div className="admin-topbar-actions">
          <button type="button" className="admin-mobile-search-toggle" aria-label="Abrir busca administrativa" aria-expanded={mobileSearchOpen} onClick={() => { setMobileSearchOpen((open) => !open); requestAnimationFrame(() => globalSearchRef.current?.focus()); }}><Search size={19} aria-hidden="true" /></button>
          <div className="admin-notifications-menu" ref={notificationsRef}>
            <button type="button" className="admin-notifications" aria-label={`Notificações: ${counts.Pendente} cadastros pendentes`} aria-haspopup="dialog" aria-expanded={notificationsOpen} aria-controls="admin-notifications-popover" onClick={() => { setNotificationsOpen((open) => !open); setProfileMenuOpen(false); }}>
              <Bell size={19} aria-hidden="true" />
              {counts.Pendente > 0 && <span className="notification-badge" aria-hidden="true" />}
            </button>
            {notificationsOpen && <div id="admin-notifications-popover" className="admin-notifications-popover" role="dialog" aria-label="Notificações de cadastros pendentes">
              <div className="notifications-popover-heading"><strong>Notificações ({counts.Pendente})</strong></div>
              {pendingNotifications.length === 0 ? <p className="notifications-empty">Nenhum cadastro aguardando análise.</p> : <ul className="notifications-list">
                {pendingNotifications.map((artist) => {
                  const hasVisiblePhoto = artist.foto_url && !(artist.foto_url.startsWith("/artistas/") && artist.status !== "Aprovado");
                  return <li key={artist.id}><button type="button" className="notification-item" onClick={() => {
                    setTab("Pendente");
                    setSelectedArtista(artist);
                    setSelectedDrawerTab("overview");
                    setGlobalSearch("");
                    setPendingSearch("");
                    setPendingCategory("");
                    setPendingCity("");
                    setPendingAvailabilityOnly(false);
                    setNotificationsOpen(false);
                    setSidebarOpen(false);
                  }}>
                    <span className="notification-avatar">{hasVisiblePhoto ? <img src={assetUrl(artist.foto_url!)} alt="" /> : <User size={16} aria-hidden="true" />}</span>
                    <span className="notification-copy"><strong>Novo cadastro aguardando análise: {artist.nome_artistico || artist.nome}</strong><time dateTime={artist.created_at}>{formatNotificationAge(artist.created_at)}</time></span>
                  </button></li>;
                })}
              </ul>}
              <button type="button" className="notifications-view-all" onClick={() => {
                setTab("Pendente");
                setSelectedArtista(null);
                setGlobalSearch("");
                setPendingSearch("");
                setNotificationsOpen(false);
                setSidebarOpen(false);
              }}>Ver todas as pendências</button>
            </div>}
          </div>
          <div className="admin-profile-menu" ref={profileMenuRef}>
            <button type="button" className="admin-profile-trigger" aria-expanded={profileMenuOpen} aria-haspopup="menu" onClick={() => { setProfileMenuOpen((open) => !open); setNotificationsOpen(false); }}>
              <span className="admin-avatar" aria-hidden="true">{(adminName || "AD").slice(0, 2).toLocaleUpperCase("pt-BR")}</span>
              <span className="admin-profile-label"><strong>{adminName || "Administrador"}</strong><small>Administrador</small></span>
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {profileMenuOpen && <div className="admin-profile-dropdown" role="menu"><span>{adminName || "Administrador"}</span><button type="button" role="menuitem" onClick={handleLogout}><LogOut size={15} aria-hidden="true" /> Sair do painel</button></div>}
          </div>
        </div>
      </header>
      {sidebarOpen && <button className="admin-sidebar-scrim" aria-label="Fechar menu do painel" onClick={() => setSidebarOpen(false)} />}
      <div className="admin-layout">
        <aside id="admin-sidebar" className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <div className="sidebar-identity">
            <Link to="/" className="sidebar-logo-link" aria-label="Voltar para a página inicial do Cadastro Municipal de Artistas">
              <img src="/cmpcc-logo.png" alt="" width={92} height={80} />
            </Link>
            <div className="sidebar-panel-title">
              <strong>Painel Administrativo</strong>
              <span>Cadastro Municipal de Artistas</span>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Seções do painel administrativo">
          {sidebarNav.map(({ key, icon, label }) => (
            <button key={key} onClick={() => { setTab(key); setSidebarOpen(false); setActionError(""); if (key === "Pendente") setSelectedArtista(artistas.find((artist) => artist.status === "Pendente") || null); }} aria-current={tab === key ? "page" : undefined} className={`sidebar-nav-item ${tab === key ? "active" : ""}`}>
              {icon}
              <span>{label}</span>
              {counts[key as keyof typeof counts] !== undefined && counts[key as keyof typeof counts] > 0 && (
                <span className="nav-count">{counts[key as keyof typeof counts]}</span>
              )}
            </button>
          ))}
          </nav>
          <div className="sidebar-city-card">
            <img src="/admin-sidebar-bage.png" alt="Prédio histórico da Prefeitura de Bagé ao entardecer" />
            <span className="sidebar-city-overlay" aria-hidden="true" />
            <div><strong>Arte que movimenta Bagé</strong><p>Cultura, pessoas e oportunidades para uma cidade mais viva.</p></div>
          </div>
        </aside>

      {/* ─── Main ─── */}
      <main className={`admin-main${tab === "Pendente" ? " admin-main--pending" : tab === "Visão geral" ? " admin-main--overview" : ""}`}>
        {actionError && !editingArtista && !deletingArtista && !deletingFeedback && <div className="admin-error" role="alert">{actionError}</div>}
        {tab === "Visão geral" ? (
          <>
            <div className="admin-dash-header">
              <div>
                <h1>Olá, {adminName || "admin"}! <span className="dash-wave" aria-hidden="true">👋</span></h1>
                <p className="dash-date"><CalendarDays size={13} /> {hoje}</p>
              </div>
              <Link to="/" className="btn btn-secondary admin-home-link">Ver catálogo público <ExternalLink size={15} aria-hidden="true" /></Link>
            </div>

            {loadingArtistas && <div className="admin-loading" role="status"><div className="spinner" aria-hidden="true" />Carregando cadastros...</div>}
            {artistasError && <div className="admin-error" role="alert">{artistasError} <button className="btn btn-secondary btn-sm" onClick={fetchArtistas}>Tentar novamente</button></div>}
            {loadingFeedbacks && <p className="dash-muted" role="status">Carregando feedbacks...</p>}
            {feedbacksError && <div className="admin-error" role="alert">{feedbacksError} <button className="btn btn-secondary btn-sm" onClick={fetchFeedbacks}>Tentar novamente</button></div>}

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon amber"><Clock size={20} /></div>
                <div className="stat-value">{loadingArtistas || artistasError ? "—" : counts.Pendente}</div>
                <div className="stat-label">Cadastros pendentes</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon teal"><CheckCircle size={20} /></div>
                <div className="stat-value">{loadingArtistas || artistasError ? "—" : counts.Aprovado}</div>
                <div className="stat-label">Aprovados no catálogo</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon rose"><XCircle size={20} /></div>
                <div className="stat-value">{loadingArtistas || artistasError ? "—" : counts.Rejeitado}</div>
                <div className="stat-label">Rejeitados</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon indigo"><MessageSquareHeart size={20} /></div>
                <div className="stat-value">{loadingFeedbacks || feedbacksError ? "—" : counts.Feedbacks}</div>
                <div className="stat-label">Feedbacks do público</div>
              </div>
            </div>

            <div className="dash-grid">
              <div className="dash-chart card">
                <div className="dash-section-title">
                  <BarChart3 size={16} /> Artistas por categoria
                </div>
                {loadingArtistas || artistasError ? (
                  <p className="dash-muted">{loadingArtistas ? "Carregando..." : "Dados indisponíveis."}</p>
                ) : chartData.length === 0 ? (
                  <p className="dash-muted">Ainda não há artistas cadastrados.</p>
                ) : (
                  <div className="chart-bars">
                    {chartData.map(({ label, count, pct }) => (
                      <div key={label} className="chart-row">
                        <span className="chart-label">{label}</span>
                        <div className="chart-track">
                          <div className="chart-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="chart-count">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dash-pending card">
                <div className="dash-section-title">
                  <Sparkles size={16} /> Análises pendentes
                </div>
                {loadingArtistas || artistasError ? (
                  <p className="dash-muted">{loadingArtistas ? "Carregando..." : "Dados indisponíveis."}</p>
                ) : pendentesRecentes.length === 0 ? (
                  <p className="dash-muted">Tudo em dia! Nenhum cadastro aguardando análise. 🎉</p>
                ) : (
                  <div className="pending-list">
                    {pendentesRecentes.map((a) => (
                      <div key={a.id} className="pending-item">
                        <div className="pending-photo">
                          {a.foto_url ? <img src={a.foto_url} alt="" /> : <User size={18} />}
                        </div>
                        <div className="pending-info">
                          <span className="pending-name">{a.nome_artistico || a.nome}</span>
                          <span className="pending-area">{a.area_atuacao}</span>
                        </div>
                        <button className="pending-approve" aria-label={`Aprovar ${a.nome}`} onClick={() => handleStatus(a, "Aprovado")} disabled={actionLoading !== null}>
                          <Check size={14} />
                        </button>
                        <button className="pending-reject" aria-label={`Rejeitar ${a.nome}`} onClick={() => handleStatus(a, "Rejeitado")} disabled={actionLoading !== null}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button className="dash-link" onClick={() => setTab("Pendente")}>Ver todos os pendentes</button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : tab === "Pendente" ? (
          <>
            <section className={`pending-workspace${selectedArtista ? " has-selection" : ""}`} aria-label="Analisar cadastros pendentes">
              <div className="pending-feed">
                <section className="pending-heading">
                  <div>
                    <p className="admin-breadcrumb">Painel <span aria-hidden="true">›</span> Cadastros pendentes</p>
                    <h1>Cadastros pendentes</h1>
                    <p className="admin-header-sub">Analise os novos cadastros de artistas que aguardam aprovação.</p>
                  </div>
                  <label className="pending-sort">
                    <ArrowUpDown size={16} aria-hidden="true" />
                    <span className="sr-only">Ordenar cadastros</span>
                    <select value={pendingSort} onChange={(event) => setPendingSort(event.target.value as typeof pendingSort)}>
                      <option value="recent">Mais recentes</option>
                      <option value="oldest">Mais antigos</option>
                      <option value="name">Nome do artista</option>
                    </select>
                  </label>
                </section>

                <section className="pending-metrics" aria-label="Resumo dos cadastros">
                  <article className="pending-metric metric-pending"><span><Clock size={19} aria-hidden="true" /></span><div><strong>{loadingArtistas || artistasError ? "—" : counts.Pendente}</strong><p>Pendentes</p><small>Aguardando análise</small></div></article>
                  <article className="pending-metric metric-approved"><span><CheckCircle size={19} aria-hidden="true" /></span><div><strong>{loadingArtistas || artistasError ? "—" : counts.Aprovado}</strong><p>Aprovados</p><small>Artistas no catálogo</small></div></article>
                  <article className="pending-metric metric-rejected"><span><XCircle size={19} aria-hidden="true" /></span><div><strong>{loadingArtistas || artistasError ? "—" : counts.Rejeitado}</strong><p>Rejeitados</p><small>Fora do catálogo</small></div></article>
                  <article className="pending-metric metric-total"><span><User size={19} aria-hidden="true" /></span><div><strong>{loadingArtistas || artistasError ? "—" : artistas.length}</strong><p>Total no sistema</p><small>Total de artistas no sistema</small></div></article>
                </section>

                <div className="pending-filters">
                  <label className="pending-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar pendentes</span><input value={pendingSearch} onChange={(event) => setPendingSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou palavra-chave..." /></label>
                  <label className="pending-select"><span className="sr-only">Filtrar por categoria</span><select value={pendingCategory} onChange={(event) => setPendingCategory(event.target.value)}><option value="">Todas as categorias</option>{pendingCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
                  <label className="pending-select"><span className="sr-only">Filtrar por cidade</span><select value={pendingCity} onChange={(event) => setPendingCity(event.target.value)}><option value="">Todas as cidades</option>{pendingCities.map((city) => <option key={city}>{city}</option>)}</select></label>
                  <button className={`pending-filter-toggle${pendingMoreFilters ? " is-active" : ""}`} type="button" aria-expanded={pendingMoreFilters} onClick={() => setPendingMoreFilters((open) => !open)}><SlidersHorizontal size={16} aria-hidden="true" /> Mais filtros</button>
                </div>
                {pendingMoreFilters && <div className="pending-extra-filters"><label><input type="checkbox" checked={pendingAvailabilityOnly} onChange={(event) => setPendingAvailabilityOnly(event.target.checked)} /> Com disponibilidade informada</label></div>}
                <div className="pending-results-heading"><h2>Fila de análise</h2><span>{loadingArtistas || artistasError ? "" : `${pendingFiltered.length} de ${counts.Pendente} cadastro(s)`}</span></div>
                {loadingArtistas ? (
                  <div className="admin-loading" role="status"><div className="spinner" aria-hidden="true" />Carregando cadastros...</div>
                ) : artistasError ? (
                  <div className="admin-error" role="alert">{artistasError} <button className="btn btn-secondary btn-sm" onClick={fetchArtistas}>Tentar novamente</button></div>
                ) : pendingFiltered.length === 0 ? (
                  <div className="admin-empty pending-empty"><Clock size={36} aria-hidden="true" /><h3>{globalSearch.trim() || pendingSearch.trim() ? "Nenhum cadastro pendente encontrado para esta busca." : counts.Pendente ? "Nenhum cadastro corresponde aos filtros" : "Nenhum cadastro aguardando análise"}</h3><p>{globalSearch.trim() || pendingSearch.trim() ? "Confira o termo digitado ou tente outra busca." : counts.Pendente ? "Ajuste a busca ou os filtros para ver outros resultados." : "Quando um novo artista se cadastrar, ele aparecerá aqui."}</p></div>
                ) : (
                  <div className="pending-cards">
                    {pendingFiltered.map((artist) => (
                      <article key={artist.id} className={`pending-card${selectedArtista?.id === artist.id ? " is-selected" : ""}`}>
                        <button type="button" className="pending-card-open" onClick={() => { setSelectedArtista(artist); setSelectedDrawerTab("overview"); }} aria-label={`Ver detalhes de ${artist.nome_artistico || artist.nome}`}>
                          <span className="pending-card-photo">{artist.foto_url && !(artist.foto_url.startsWith("/artistas/") && artist.status !== "Aprovado") ? <img src={assetUrl(artist.foto_url)} alt="" /> : <User size={24} aria-hidden="true" />}</span>
                          <span className="pending-card-identity">
                            <span className="pending-card-name">{artist.nome_artistico || artist.nome} <em>Novo</em></span>
                            <span className="pending-card-meta"><LayoutGrid size={12} aria-hidden="true" />{artist.area_atuacao || "Categoria não informada"}</span>
                            <span className="pending-card-meta"><MapPin size={12} aria-hidden="true" />{artist.cidade || "Cidade não informada"}, RS</span>
                            <span className="pending-card-email"><Mail size={12} aria-hidden="true" />{artist.email}</span>
                          </span>
                          <span className="pending-card-bio">{artist.bio}</span>
                        </button>
                        <div className="pending-card-actions">
                          <time className="pending-card-age" dateTime={artist.created_at}>{formatAge(artist.created_at)}</time>
                          <div className="pending-card-action-buttons">
                            <button type="button" className="pending-approve-text" onClick={() => handleStatus(artist, "Aprovado")} disabled={actionLoading !== null}><Check size={15} aria-hidden="true" /> Aprovar</button>
                            <button type="button" className="pending-reject-text" onClick={() => handleStatus(artist, "Rejeitado")} disabled={actionLoading !== null}><X size={15} aria-hidden="true" /> Rejeitar</button>
                            <button type="button" className="pending-edit-text" onClick={() => handleOpenEdit(artist)}><Pencil size={15} aria-hidden="true" /> Editar</button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {selectedArtista && <button type="button" className="pending-detail-scrim" onClick={() => setSelectedArtista(null)} aria-label="Fechar detalhes do cadastro" />}
              {selectedArtista && (
                <aside className="pending-detail" aria-label={`Detalhes de ${selectedArtista.nome_artistico || selectedArtista.nome}`}>
                  <button type="button" className="pending-detail-close" onClick={() => setSelectedArtista(null)} aria-label="Fechar detalhes"><X size={20} aria-hidden="true" /></button>
                  {selectedArtistHasPhoto && <div className="pending-detail-cover"><img src={assetUrl(selectedArtista.foto_url!)} alt="" /></div>}
                  <div className={`pending-detail-title${selectedArtistHasPhoto ? "" : " pending-detail-title--no-cover"}`}>
                    <span className="pending-detail-avatar">{selectedArtistHasPhoto ? <img src={assetUrl(selectedArtista.foto_url!)} alt="" /> : <User size={20} aria-hidden="true" />}</span>
                    <div><h2>{selectedArtista.nome_artistico || selectedArtista.nome}</h2><span>Artista</span></div>
                  </div>
                  <div className="pending-detail-tabs" role="group" aria-label="Seções dos detalhes">
                    <button type="button" aria-pressed={selectedDrawerTab === "overview"} className={selectedDrawerTab === "overview" ? "active" : ""} onClick={() => setSelectedDrawerTab("overview")}>Visão geral</button>
                    <button type="button" aria-pressed={selectedDrawerTab === "portfolio"} className={selectedDrawerTab === "portfolio" ? "active" : ""} onClick={() => setSelectedDrawerTab("portfolio")}>Portfólio</button>
                    <button type="button" aria-pressed={selectedDrawerTab === "documents"} className={selectedDrawerTab === "documents" ? "active" : ""} onClick={() => setSelectedDrawerTab("documents")}>Documentos</button>
                  </div>
                  <div className="pending-detail-content">
                    {selectedDrawerTab === "overview" ? <>
                      <h3>Informações principais</h3>
                      <p><LayoutGrid size={16} aria-hidden="true" /> {selectedArtista.area_atuacao || "Categoria não informada"}</p>
                      <p><MapPin size={16} aria-hidden="true" /> {selectedArtista.cidade || "Cidade não informada"}</p>
                      <p><Mail size={16} aria-hidden="true" /> <a href={`mailto:${selectedArtista.email}`}>{selectedArtista.email}</a></p>
                      <p><Phone size={16} aria-hidden="true" /> {selectedArtista.contato || "Telefone não informado"}</p>
                      <p><CalendarDays size={16} aria-hidden="true" /> Disponibilidade <span className={selectedArtista.disponibilidade?.length ? "pending-availability-pill" : "pending-detail-muted"}>{selectedArtista.disponibilidade?.length ? "Sim" : "Não informada"}</span></p>
                      <h3>Sobre o artista</h3><p className="pending-detail-bio">{selectedArtista.bio || "Biografia não informada."}</p>
                      {(selectedArtista.tags?.length ?? 0) > 0 && <><h3>Tags</h3><div className="pending-detail-tags">{selectedArtista.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div></>}
                      <h3>Links</h3>
                      {selectedArtista.instagram && <p><LinkIcon size={16} aria-hidden="true" /> {selectedArtista.instagram}</p>}
                      {selectedArtista.site && <p><Globe size={16} aria-hidden="true" /> <a href={selectedArtista.site} target="_blank" rel="noreferrer">{selectedArtista.site}<ExternalLink size={12} aria-hidden="true" /></a></p>}
                      {!selectedArtista.instagram && !selectedArtista.site && <p className="pending-detail-muted">Nenhum link informado.</p>}
                    </> : <>
                      <h3>{selectedDrawerTab === "portfolio" ? "Portfólio do artista" : "Documentos enviados"}</h3>
                      <p>Os arquivos ficam em armazenamento privado. Abra a área de mídias para consultar e baixar os materiais com acesso administrativo.</p>
                      <button type="button" className="btn btn-secondary pending-open-media" onClick={() => setToolsArtist(selectedArtista)}><ImageIcon size={16} aria-hidden="true" /><FileText size={16} aria-hidden="true" /> Abrir mídias e documentos</button>
                    </>}
                  </div>
                  <div className="pending-detail-actions">
                    <button type="button" className="pending-approve-text" onClick={() => handleStatus(selectedArtista, "Aprovado")} disabled={actionLoading !== null}><Check size={15} aria-hidden="true" /> Aprovar</button>
                    <button type="button" className="pending-reject-text" onClick={() => handleStatus(selectedArtista, "Rejeitado")} disabled={actionLoading !== null}><X size={15} aria-hidden="true" /> Rejeitar</button>
                    <button type="button" className="pending-edit-text" onClick={() => handleOpenEdit(selectedArtista)}><Pencil size={15} aria-hidden="true" /> Editar</button>
                  </div>
                </aside>
              )}
            </section>
          </>
        ) : tab === "Feedbacks" ? (
          <>
            <div className="admin-header">
              <h1>Mensagens de <span className="badge badge-indigo">Feedback</span></h1>
              <p className="admin-header-sub">{loadingFeedbacks || feedbacksError ? "" : `${visibleFeedbacks.length} feedback(s) encontrado(s)`}</p>
            </div>
            {loadingFeedbacks ? (
              <div className="admin-loading" role="status"><div className="spinner" aria-hidden="true" />Carregando feedbacks...</div>
            ) : feedbacksError ? (
              <div className="admin-error" role="alert">{feedbacksError} <button className="btn btn-secondary btn-sm" onClick={fetchFeedbacks}>Tentar novamente</button></div>
            ) : visibleFeedbacks.length === 0 ? (
              <div className="admin-empty">
                <MessageSquareHeart size={40} />
                <h3>{feedbacks.length ? "Nenhum feedback corresponde à busca" : "Nenhum feedback recebido ainda"}</h3>
                <p>{feedbacks.length ? "Tente outro termo na busca do painel." : "Quando o público enviar avaliações, elas aparecerão aqui."}</p>
              </div>
            ) : (
              <div className="artistas-list">
                {visibleFeedbacks.map((fb) => (
                  <div key={fb.id} className="artista-row card">
                    <div className="artista-row-placeholder feedback-avatar">
                      <MessageSquareHeart size={24} />
                    </div>
                    <div className="artista-row-info">
                      <div className="artista-row-top">
                        <h3>{fb.nome || "Anônimo"}</h3>
                        <span className={`badge ${TIPO_BADGE[fb.tipo] || "badge-purple"}`}>{fb.tipo}</span>
                        {fb.nota ? (
                          <span className="feedback-rating">
                            {Array.from({ length: fb.nota }).map((_, i) => (
                              <Star key={i} size={13} fill="currentColor" />
                            ))}
                          </span>
                        ) : null}
                      </div>
                      <p className="feedback-message">{fb.mensagem}</p>
                      <div className="artista-contacts">
                        {fb.email && <span>{fb.email}</span>}
                        {fb.created_at && <span>• {new Date(fb.created_at).toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </div>
                    <div className="artista-row-actions">
                      <button className="btn btn-danger btn-sm" onClick={() => handleOpenDeleteFeedback(fb)} title="Excluir feedback">
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="admin-header">
              <h1>Cadastros <span className={`badge ${STATUS_BADGE[tab]}`}>{tab}s</span></h1>
              <p className="admin-header-sub">{loadingArtistas || artistasError ? "" : `${filtered.length} cadastro(s) encontrado(s)`}</p>
            </div>
            {loadingArtistas ? (
              <div className="admin-loading" role="status"><div className="spinner" aria-hidden="true" />Carregando cadastros...</div>
            ) : artistasError ? (
              <div className="admin-error" role="alert">{artistasError} <button className="btn btn-secondary btn-sm" onClick={fetchArtistas}>Tentar novamente</button></div>
            ) : filtered.length === 0 ? (
              <div className="admin-empty">
                <Clock size={40} />
                <h3>Nenhum cadastro {tab.toLowerCase()} ainda</h3>
              </div>
            ) : (
              <div className="artistas-list">
                {filtered.map((artista) => (
                  <div key={artista.id} className={`artista-row card${artista.status === "Aprovado" ? " artista-row--approved" : artista.status === "Rejeitado" ? " artista-row--rejected" : ""}`}>
                    <div className="artista-row-summary">
                      <div className="artista-row-photo">
                        {artista.foto_url && !(artista.foto_url.startsWith("/artistas/") && artista.status!=="Aprovado") ? (
                          <img src={assetUrl(artista.foto_url)} alt={artista.nome} />
                        ) : (
                          <div className="artista-row-placeholder"><User size={24} /></div>
                        )}
                      </div>
                      <div className="artista-row-info">
                        <div className="artista-row-top">
                          <h3>{artista.nome}</h3>
                          <span className={`badge ${STATUS_BADGE[artista.status]}`}>{artista.status}</span>
                          {(artista.tags || []).length > 0 && (
                            <span className="artista-tags-mini">{artista.tags!.slice(0, 2).join(" · ")}</span>
                          )}
                        </div>
                        <p className="artista-area">{artista.status === "Rejeitado" && <LayoutGrid size={14} aria-hidden="true" />}{artista.area_atuacao}</p>
                        {artista.status !== "Aprovado" && artista.status !== "Rejeitado" && <p className="artista-bio-preview">{artista.bio}</p>}
                        <div className={`artista-contacts${artista.status === "Rejeitado" ? " rejected-artist-contacts" : ""}`}>
                          {artista.status === "Rejeitado" ? <>
                            <span><Mail size={14} aria-hidden="true" />{artista.email}</span>
                            {artista.contato && <span><Phone size={14} aria-hidden="true" />{artista.contato}</span>}
                            {artista.instagram && <span><Globe size={14} aria-hidden="true" />{artista.instagram}</span>}
                          </> : <>
                            <span>{artista.email}</span>
                            {artista.instagram && <span>• {artista.instagram}</span>}
                            {artista.contato && <span>• {artista.contato}</span>}
                          </>}
                        </div>
                      </div>
                    </div>
                    {(artista.status === "Aprovado" || artista.status === "Rejeitado") && <p className="artista-bio-preview approved-artista-bio">{artista.bio}</p>}
                    <div className="artista-row-actions">
                      {artista.status === "Pendente" && <div className="actions-status">
                        {artista.status === "Pendente" && (
                          <>
                            <button className="btn btn-sm btn-approve" onClick={() => handleStatus(artista, "Aprovado")} disabled={actionLoading !== null}>
                              <Check size={14} /> Aprovar
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleStatus(artista, "Rejeitado")} disabled={actionLoading !== null}>
                              <X size={14} /> Rejeitar
                            </button>
                          </>
                        )}
                      </div>}
                      <div className="actions-crud">
                        {artista.status !== "Rejeitado" && <button className="btn btn-secondary btn-sm" data-artist-tools-id={artista.id} onClick={()=>setToolsArtist(artista)} aria-label={`Mídias e agenda de ${artista.nome}`}>Mídias e agenda</button>}
                        {artista.status==="Aprovado"&&<Link className="btn btn-secondary btn-sm" to={`/artistas/${artista.id}`}>Ver perfil</Link>}
                        {artista.status !== "Rejeitado" && <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(artista)} title="Editar dados">
                          <Pencil size={14} /> Editar
                        </button>}
                        {artista.status === "Rejeitado" && <button className="btn btn-sm btn-approve" onClick={() => handleStatus(artista, "Aprovado")} disabled={actionLoading !== null}>
                          <Check size={14} /> Aprovar
                        </button>}
                        {artista.status === "Aprovado" && <button className="btn btn-danger btn-sm" onClick={() => handleStatus(artista, "Rejeitado")} disabled={actionLoading !== null} title="Mover para rejeitados">
                          <X size={14} /> Rejeitar
                        </button>}
                        {artista.status === "Rejeitado" && <button className="btn btn-danger btn-sm" onClick={() => handleOpenDelete(artista)} title="Excluir permanentemente">
                          <Trash2 size={14} /> Excluir
                        </button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      </div>

      {/* Modal de Edição */}
      {editingArtista && (
        <div className="modal-overlay">
          <div ref={editDialogRef} className="modal-content card admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-edit-title" tabIndex={-1}>
            <div className="modal-header">
              <h2 id="admin-edit-title">Editar Cadastro de Artista</h2>
              <button className="modal-close" aria-label="Fechar edição" onClick={() => setEditingArtista(null)} disabled={submittingModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="edit-nome">Nome do Artista *</label>
                  <input id="edit-nome" value={editForm.nome || ""} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label htmlFor="edit-nome-artistico">Nome artístico</label>
                  <input id="edit-nome-artistico" value={editForm.nome_artistico || ""} onChange={(e) => setEditForm({ ...editForm, nome_artistico: e.target.value })} />
                </div>
                <div className="input-group">
                  <label htmlFor="edit-email">E-mail *</label>
                  <input id="edit-email" type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label htmlFor="edit-contato">Telefone / Contato</label>
                  <input id="edit-contato" value={editForm.contato || ""} onChange={(e) => setEditForm({ ...editForm, contato: e.target.value })} />
                </div>
                <div className="input-group">
                  <label htmlFor="edit-cidade">Cidade</label>
                  <input id="edit-cidade" value={editForm.cidade || ""} onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })} />
                </div>
                <div className="input-group">
                  <label htmlFor="edit-area">Área de Atuação *</label>
                  <select id="edit-area" value={editForm.area_atuacao || ""} onChange={(e) => setEditForm({ ...editForm, area_atuacao: e.target.value })} className="select-input" required>
                    {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="edit-status">Status</label>
                  <select id="edit-status" value={editForm.status || "Pendente"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="select-input">
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rejeitado">Rejeitado</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="edit-tags">Tags (separadas por vírgula)</label>
                  <input id="edit-tags" value={editTagsText} onChange={(e) => setEditTagsText(e.target.value)} placeholder="MPB, Acústico, Shows ao vivo" />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: 16 }}>
                <label htmlFor="edit-bio">Mini-Bio / História</label>
                <textarea id="edit-bio" rows={3} value={editForm.bio || ""} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>

              <div className="input-group" style={{ marginTop: 16 }}>
                <span id="edit-disponibilidade-label">Disponibilidade</span>
                <div className="avail-grid" role="group" aria-labelledby="edit-disponibilidade-label">
                  {DISPONIBILIDADES.map((v) => {
                    const cur = (editForm.disponibilidade || []) as string[];
                    return (
                      <button key={v} type="button" onClick={() => toggleEditDisponibilidade(v)} aria-pressed={cur.includes(v)} className={`avail-btn ${cur.includes(v) ? "active" : ""}`}>
                        {cur.includes(v) && <Check size={13} />}
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: 16 }}>
                <div className="input-group">
                  <label htmlFor="edit-foto">URL da Foto</label>
                  <input id="edit-foto" value={editForm.foto_url || ""} onChange={(e) => setEditForm({ ...editForm, foto_url: e.target.value })} />
                </div>
                <div className="input-group">
                  <label htmlFor="edit-instagram">Instagram</label>
                  <input id="edit-instagram" value={editForm.instagram || ""} onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })} />
                </div>
                <div className="input-group" style={{ gridColumn: "span 2" }}>
                  <label htmlFor="edit-site">Site / Portfólio</label>
                  <input id="edit-site" value={editForm.site || ""} onChange={(e) => setEditForm({ ...editForm, site: e.target.value })} />
                </div>
              </div>

              {actionError && <div className="admin-error" role="alert">{actionError}</div>}
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingArtista(null)} disabled={submittingModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submittingModal}><Save size={16} /> Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingArtista && (
        <div className="modal-overlay">
          <div ref={deleteArtistaRef} className="modal-content card delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-artista-title" aria-describedby="delete-artista-description" tabIndex={-1}>
            <div className="delete-modal-icon"><AlertTriangle size={32} /></div>
            <h2 id="delete-artista-title">Confirmar Exclusão</h2>
            <p id="delete-artista-description">Tem certeza que deseja excluir permanentemente o cadastro do artista <strong>"{deletingArtista.nome}"</strong>? Esta ação não pode ser desfeita.</p>
            {actionError && <div className="admin-error" role="alert">{actionError}</div>}
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setDeletingArtista(null)} disabled={submittingModal}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={submittingModal}><Trash2 size={16} /> Sim, Excluir Definitivamente</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Feedback */}
      {deletingFeedback && (
        <div className="modal-overlay">
          <div ref={deleteFeedbackRef} className="modal-content card delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-feedback-title" aria-describedby="delete-feedback-description" tabIndex={-1}>
            <div className="delete-modal-icon"><MessageSquareHeart size={32} /></div>
            <h2 id="delete-feedback-title">Confirmar Exclusão</h2>
            <p id="delete-feedback-description">Tem certeza que deseja excluir permanentemente este feedback? Esta ação não pode ser desfeita.</p>
            {actionError && <div className="admin-error" role="alert">{actionError}</div>}
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setDeletingFeedback(null)} disabled={submittingModal}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleConfirmDeleteFeedback} disabled={submittingModal}><Trash2 size={16} /> Sim, Excluir Definitivamente</button>
            </div>
          </div>
        </div>
      )}
      {toolsArtist&&<ArtistTools artist={toolsArtist} onClose={()=>{const id=toolsArtist.id;setToolsArtist(null);void fetchArtistas().then(()=>requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>(`[data-artist-tools-id="${id}"]`)?.focus()));}}/>}
    </div>
  );
}
