import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { adminFetch } from "../../lib/adminApi";
import { useDialogFocus } from "../../lib/useDialogFocus";
import {
  CheckCircle, Clock, XCircle, LogOut, Star, Check, X, User,
  Pencil, Trash2, Save, AlertTriangle, MessageSquareHeart, Sparkles,
  LayoutGrid, BarChart3, CalendarDays, Palette, Menu
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

type Tab = "Visão geral" | "Pendente" | "Aprovado" | "Rejeitado" | "Feedbacks";

export default function AdminDashboard() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingArtistas, setLoadingArtistas] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [artistasError, setArtistasError] = useState("");
  const [feedbacksError, setFeedbacksError] = useState("");
  const [actionError, setActionError] = useState("");
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");

  const [editingArtista, setEditingArtista] = useState<Artista | null>(null);
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
      setAdminName(email.split("@")[0]);
    }).catch(() => setAdminName(""));
  }, []);

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

  const filtered = tab === "Visão geral" || tab === "Feedbacks" ? [] : artistas.filter((a) => a.status === tab);

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    artistas.forEach((a) => map.set(a.area_atuacao || "Outra", (map.get(a.area_atuacao || "Outra") || 0) + 1));
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...sorted.map(([, n]) => n));
    return sorted.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }));
  }, [artistas]);

  const pendentesRecentes = artistas.filter((a) => a.status === "Pendente").slice(0, 3);
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const sidebarNav: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: "Visão geral", icon: <LayoutGrid size={18} />, label: "Visão geral" },
    { key: "Pendente", icon: <Clock size={18} />, label: "Pendentes" },
    { key: "Aprovado", icon: <CheckCircle size={18} />, label: "Aprovados" },
    { key: "Rejeitado", icon: <XCircle size={18} />, label: "Rejeitados" },
    { key: "Feedbacks", icon: <MessageSquareHeart size={18} />, label: "Feedbacks" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-mobile-bar">
        <button ref={menuButtonRef} className="btn btn-secondary" type="button" aria-label={sidebarOpen ? "Fechar menu do painel" : "Abrir menu do painel"} aria-expanded={sidebarOpen} aria-controls="admin-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={18} /> Menu</button>
        <Link to="/" className="btn btn-secondary btn-sm">Ver catálogo</Link>
      </div>
      {sidebarOpen && <button className="admin-sidebar-scrim" aria-label="Fechar menu do painel" onClick={() => setSidebarOpen(false)} />}
      {/* ─── Sidebar ─── */}
      <aside id="admin-sidebar" className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><Palette size={18} /></div>
          <div>
            <span className="brand-title">Gestores do Conselho Municipal de Políticas Culturais</span>
            <span className="brand-sub">painel administrativo</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarNav.map(({ key, icon, label }) => (
            <button key={key} onClick={() => { setTab(key); setSidebarOpen(false); setActionError(""); }} aria-current={tab === key ? "page" : undefined} className={`sidebar-nav-item ${tab === key ? "active" : ""}`}>
              {icon}
              <span>{label}</span>
              {counts[key as keyof typeof counts] !== undefined && counts[key as keyof typeof counts] > 0 && (
                <span className="nav-count">{counts[key as keyof typeof counts]}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-progress">
          <div className="sidebar-progress-head">
            <span>Cadastros aprovados</span>
            <strong>{loadingArtistas || artistasError ? "—" : `${artistas.length ? Math.round((counts.Aprovado / artistas.length) * 100) : 0}%`}</strong>
          </div>
          <div className="sidebar-progress-bar">
            <div className="sidebar-progress-fill" style={{ width: `${artistas.length ? (counts.Aprovado / artistas.length) * 100 : 0}%` }} />
          </div>
          <p className="sidebar-progress-sub">{loadingArtistas || artistasError ? "Dados indisponíveis" : `${counts.Aprovado} de ${artistas.length} artistas no catálogo`}</p>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar"><User size={15} /></div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{adminName || "admin"}</span>
            <span className="sidebar-user-role">Administrador</span>
          </div>
          <button onClick={handleLogout} className="sidebar-logout" title="Sair" aria-label="Sair do painel">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="admin-main">
        {actionError && !editingArtista && !deletingArtista && !deletingFeedback && <div className="admin-error" role="alert">{actionError}</div>}
        {tab === "Visão geral" ? (
          <>
            <div className="admin-dash-header">
              <div>
                <h2>Olá, {adminName || "admin"}! <span className="dash-wave">👋</span></h2>
                <p className="dash-date"><CalendarDays size={13} /> {hoje}</p>
              </div>
              <Link to="/" className="btn btn-secondary admin-home-link">Ver catálogo público</Link>
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
        ) : tab === "Feedbacks" ? (
          <>
            <div className="admin-header">
              <h1>Mensagens de <span className="badge badge-indigo">Feedback</span></h1>
              <p className="admin-header-sub">{loadingFeedbacks || feedbacksError ? "" : `${feedbacks.length} feedback(s) recebido(s)`}</p>
            </div>
            {loadingFeedbacks ? (
              <div className="admin-loading" role="status"><div className="spinner" aria-hidden="true" />Carregando feedbacks...</div>
            ) : feedbacksError ? (
              <div className="admin-error" role="alert">{feedbacksError} <button className="btn btn-secondary btn-sm" onClick={fetchFeedbacks}>Tentar novamente</button></div>
            ) : feedbacks.length === 0 ? (
              <div className="admin-empty">
                <MessageSquareHeart size={40} />
                <h3>Nenhum feedback recebido ainda</h3>
                <p>Quando o público enviar avaliações, elas aparecerão aqui.</p>
              </div>
            ) : (
              <div className="artistas-list">
                {feedbacks.map((fb) => (
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
                  <div key={artista.id} className="artista-row card">
                    <div className="artista-row-photo">
                      {artista.foto_url ? (
                        <img src={artista.foto_url} alt={artista.nome} />
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
                      <p className="artista-area">{artista.area_atuacao}</p>
                      <p className="artista-bio-preview">{artista.bio}</p>
                      <div className="artista-contacts">
                        <span>{artista.email}</span>
                        {artista.instagram && <span>• {artista.instagram}</span>}
                        {artista.contato && <span>• {artista.contato}</span>}
                      </div>
                    </div>
                    <div className="artista-row-actions">
                      <div className="actions-status">
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
                        {artista.status === "Aprovado" && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(artista, "Rejeitado")} disabled={actionLoading !== null}>
                            <X size={14} /> Desaprovar
                          </button>
                        )}
                        {artista.status === "Rejeitado" && (
                          <button className="btn btn-sm btn-approve" onClick={() => handleStatus(artista, "Aprovado")} disabled={actionLoading !== null}>
                            <Check size={14} /> Aprovar
                          </button>
                        )}
                      </div>
                      <div className="actions-crud">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(artista)} title="Editar dados">
                          <Pencil size={14} /> Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleOpenDelete(artista)} title="Excluir permanentemente">
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

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
    </div>
  );
}
