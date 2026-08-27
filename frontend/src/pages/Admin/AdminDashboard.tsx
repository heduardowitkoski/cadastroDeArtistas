import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Users, CheckCircle, Clock, XCircle, LogOut, Palette,
  Check, X, User, Pencil, Trash2, Save, AlertTriangle
} from "lucide-react";
import "./AdminDashboard.css";

interface Artista {
  id: number;
  nome: string;
  area_atuacao: string;
  bio: string;
  email: string;
  contato: string;
  cidade: string;
  foto_url?: string;
  instagram?: string;
  site?: string;
  status: string;
  created_at: string;
}

const CATEGORIAS = ["Música", "Artes Visuais", "Fotografia", "Literatura", "Teatro", "Dança", "Artesanato", "Circo", "Cinema", "Outra"];

const STATUS_BADGE: Record<string, string> = {
  Aprovado: "badge-teal",
  Pendente: "badge-amber",
  Rejeitado: "badge-rose",
};

export default function AdminDashboard() {
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"Pendente" | "Aprovado" | "Rejeitado">("Pendente");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Modals state
  const [editingArtista, setEditingArtista] = useState<Artista | null>(null);
  const [editForm, setEditForm] = useState<Partial<Artista>>({});
  const [deletingArtista, setDeletingArtista] = useState<Artista | null>(null);
  const [submittingModal, setSubmittingModal] = useState(false);

  const navigate = useNavigate();

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  const fetchArtistas = () => {
    setLoading(true);
    fetch(`${API_URL}/artistas`)
      .then((r) => r.json())
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
  };

  useEffect(() => { fetchArtistas(); }, []);

  const handleStatus = async (artista: Artista, status: string) => {
    setActionLoading(artista.id);
    try {
      await fetch(`${API_URL}/artistas/${artista.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchArtistas();
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEdit = (artista: Artista) => {
    setEditingArtista(artista);
    setEditForm({ ...artista });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtista) return;
    setSubmittingModal(true);
    try {
      const res = await fetch(`${API_URL}/artistas/${editingArtista.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingArtista(null);
        fetchArtistas();
      } else {
        alert("Erro ao salvar alterações do artista.");
      }
    } catch {
      alert("Erro de conexão ao atualizar artista.");
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleOpenDelete = (artista: Artista) => {
    setDeletingArtista(artista);
  };

  const handleConfirmDelete = async () => {
    if (!deletingArtista) return;
    setSubmittingModal(true);
    try {
      const res = await fetch(`${API_URL}/artistas/${deletingArtista.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingArtista(null);
        fetchArtistas();
      } else {
        alert("Erro ao excluir artista.");
      }
    } catch {
      alert("Erro de conexão ao excluir artista.");
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const filtered = artistas.filter((a) => a.status === tab);
  const counts = {
    Pendente: artistas.filter((a) => a.status === "Pendente").length,
    Aprovado: artistas.filter((a) => a.status === "Aprovado").length,
    Rejeitado: artistas.filter((a) => a.status === "Rejeitado").length,
  };

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Palette size={20} /></div>
          <div>
            <span className="brand-title">Artistas</span>
            <span className="brand-sub">Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {(["Pendente", "Aprovado", "Rejeitado"] as const).map((status) => {
            const icons = { Pendente: Clock, Aprovado: CheckCircle, Rejeitado: XCircle };
            const Icon = icons[status];
            return (
              <button
                key={status}
                onClick={() => setTab(status)}
                className={`sidebar-nav-item ${tab === status ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{status}s</span>
                {counts[status] > 0 && <span className="nav-count">{counts[status]}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-stats">
          <div className="mini-stat"><Users size={14} /><span>Total: {artistas.length}</span></div>
        </div>

        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={16} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Cadastros <span className={`badge ${STATUS_BADGE[tab]}`}>{tab}s</span></h1>
            <p className="admin-header-sub">{filtered.length} cadastro(s) encontrado(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="spinner" /></div>
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
                        <button
                          className="btn btn-sm"
                          style={{ background: "rgba(20,184,166,0.15)", color: "var(--teal)", border: "1px solid rgba(20,184,166,0.3)" }}
                          onClick={() => handleStatus(artista, "Aprovado")}
                          disabled={actionLoading === artista.id}
                        >
                          <Check size={14} /> Aprovar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStatus(artista, "Rejeitado")}
                          disabled={actionLoading === artista.id}
                        >
                          <X size={14} /> Rejeitar
                        </button>
                      </>
                    )}
                    {artista.status === "Aprovado" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleStatus(artista, "Rejeitado")}
                        disabled={actionLoading === artista.id}
                      >
                        <X size={14} /> Desaprovar
                      </button>
                    )}
                    {artista.status === "Rejeitado" && (
                      <button
                        className="btn btn-sm"
                        style={{ background: "rgba(20,184,166,0.15)", color: "var(--teal)", border: "1px solid rgba(20,184,166,0.3)" }}
                        onClick={() => handleStatus(artista, "Aprovado")}
                        disabled={actionLoading === artista.id}
                      >
                        <Check size={14} /> Aprovar
                      </button>
                    )}
                  </div>
                  
                  <div className="actions-crud">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(artista)}
                      title="Editar dados"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleOpenDelete(artista)}
                      title="Excluir permanentemente"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Edição */}
      {editingArtista && (
        <div className="modal-overlay">
          <div className="modal-content card admin-modal">
            <div className="modal-header">
              <h2>Editar Cadastro de Artista</h2>
              <button className="modal-close" onClick={() => setEditingArtista(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Nome do Artista *</label>
                  <input
                    value={editForm.nome || ""}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>E-mail *</label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Telefone / Contato</label>
                  <input
                    value={editForm.contato || ""}
                    onChange={(e) => setEditForm({ ...editForm, contato: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Cidade</label>
                  <input
                    value={editForm.cidade || ""}
                    onChange={(e) => setEditForm({ ...editForm, cidade: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Área de Atuação *</label>
                  <select
                    value={editForm.area_atuacao || ""}
                    onChange={(e) => setEditForm({ ...editForm, area_atuacao: e.target.value })}
                    className="select-input"
                    required
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select
                    value={editForm.status || "Pendente"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="select-input"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rejeitado">Rejeitado</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: 16 }}>
                <label>Mini-Bio / História</label>
                <textarea
                  rows={3}
                  value={editForm.bio || ""}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              <div className="form-grid" style={{ marginTop: 16 }}>
                <div className="input-group">
                  <label>URL da Foto</label>
                  <input
                    value={editForm.foto_url || ""}
                    onChange={(e) => setEditForm({ ...editForm, foto_url: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Instagram</label>
                  <input
                    value={editForm.instagram || ""}
                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                  />
                </div>
                <div className="input-group" style={{ gridColumn: "span 2" }}>
                  <label>Site / Portfólio</label>
                  <input
                    value={editForm.site || ""}
                    onChange={(e) => setEditForm({ ...editForm, site: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingArtista(null)}
                  disabled={submittingModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingModal}
                >
                  <Save size={16} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingArtista && (
        <div className="modal-overlay">
          <div className="modal-content card delete-modal">
            <div className="delete-modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h2>Confirmar Exclusão</h2>
            <p>
              Tem certeza que deseja excluir permanentemente o cadastro do artista{" "}
              <strong>"{deletingArtista.nome}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingArtista(null)}
                disabled={submittingModal}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={submittingModal}
              >
                <Trash2 size={16} /> Sim, Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
