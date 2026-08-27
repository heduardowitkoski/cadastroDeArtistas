import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Users, CheckCircle, Clock, XCircle, LogOut, Palette,
  Check, X, User
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
