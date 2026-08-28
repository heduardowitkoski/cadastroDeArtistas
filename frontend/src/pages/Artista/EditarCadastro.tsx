import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Star, Check, Loader, User, Save, LogOut, CheckCircle, AlertCircle
} from "lucide-react";
import "../Cadastro/Cadastro.css";
import "./Artista.css";

const CATEGORIAS = [
  "Música", "Teatro", "Dança", "Artes Visuais", "Literatura", "Circo",
  "Fotografia", "Artesanato", "Cinema", "Outra",
];
const DISPONIBILIDADES = ["Fins de semana", "Dias úteis", "Feriados", "Eventos noturnos", "Eventos diurnos"];

interface Artista {
  id: number;
  nome: string;
  nome_artistico?: string;
  email: string;
  contato: string;
  cidade: string;
  area_atuacao: string;
  bio: string;
  tags?: string[];
  disponibilidade?: string[];
  foto_url?: string;
  instagram?: string;
  site?: string;
  status: string;
}

const vazio = {
  nome: "", nome_artistico: "", email: "", contato: "", cidade: "Bagé",
  area_atuacao: "", bio: "", tags: "", disponibilidade: [] as string[],
  foto_url: "", instagram: "", site: "",
};

export default function EditarCadastro() {
  const [form, setForm] = useState({ ...vazio });
  const [artistaId, setArtistaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const email = data.user?.email || "";
      if (!email || !active) return;
      try {
        const res = await fetch(`${API_URL}/artistas`);
        const data2 = await res.json();
        const me = Array.isArray(data2)
          ? data2.find((a: Artista) => a.email.toLowerCase() === email.toLowerCase())
          : null;
        if (me) {
          setArtistaId(me.id);
          setForm({
            nome: me.nome || "", nome_artistico: me.nome_artistico || "",
            email: me.email || "", contato: me.contato || "", cidade: me.cidade || "Bagé",
            area_atuacao: me.area_atuacao || "", bio: me.bio || "",
            tags: (me.tags || []).join(", "),
            disponibilidade: me.disponibilidade || [],
            foto_url: me.foto_url || "", instagram: me.instagram || "", site: me.site || "",
          });
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [API_URL]);

  const update = (field: keyof typeof vazio, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDisponibilidade = (v: string) =>
    setForm((prev) => ({
      ...prev,
      disponibilidade: prev.disponibilidade.includes(v)
        ? prev.disponibilidade.filter((x) => x !== v)
        : [...prev.disponibilidade, v],
    }));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/artista/login");
  };

  const handleSave = async () => {
    if (!artistaId) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/artistas/${artistaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          nome_artistico: form.nome_artistico || null,
          email: form.email,
          contato: form.contato,
          cidade: form.cidade || "Bagé",
          area_atuacao: form.area_atuacao,
          bio: form.bio,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          disponibilidade: form.disponibilidade,
          foto_url: form.foto_url || null,
          instagram: form.instagram || null,
          site: form.site || null,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const detail = errData?.message ? (Array.isArray(errData.message) ? errData.message.join(", ") : errData.message) : `Erro ${res.status}`;
        throw new Error(detail);
      }
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Erro ao atualizar:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível conectar ao servidor.";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("http://localhost")) {
        setError("Não foi possível conectar ao servidor.");
      } else {
        setError(`Erro ao salvar: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cadastro-page">
      {/* ─── Header ─── */}
      <header className="artista-header">
        <div className="container header-content">
          <div className="header-brand">
            <div className="brand-icon"><Star size={16} /></div>
            <div>
              <span className="brand-title block">Cadastro Municipal de Artistas</span>
              <span className="artista-header-sub">Área do Artista</span>
            </div>
          </div>
          <div className="artista-header-actions">
            <Link to="/" className="artista-sair">Ver catálogo</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sair">
              <LogOut size={14} /> Sair
            </button>
            <div className="artista-avatar"><User size={16} /></div>
          </div>
        </div>
      </header>

      <div className="container artista-container">
        <div className="artista-title-wrap">
          <h1>Editar meu cadastro</h1>
          <p>Mantenha seus dados atualizados. Ao salvar, o cadastro volta para análise da Secretaria.</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : !artistaId ? (
          <div className="artista-card" style={{ textAlign: "center", padding: 48 }}>
            <AlertCircle size={40} color="var(--amber)" style={{ margin: "0 auto 12px", display: "block" }} />
            <h2>Nenhum cadastro encontrado</h2>
            <p style={{ color: "var(--text-secondary)", margin: "12px 0 20px", fontSize: 14 }}>
              Não há nenhum perfil de artista vinculado a este e-mail. Faça um novo cadastro para entrar no catálogo.
            </p>
            <Link to="/cadastrar" className="btn btn-primary">Fazer cadastro</Link>
          </div>
        ) : (
          <>
            <div className="artista-card">
              {success && (
                <div className="editar-banner ok">
                  <CheckCircle size={16} /> Cadastro atualizado! Ele voltou para análise e aparecerá no catálogo após a aprovação.
                </div>
              )}
              {error && <div className="form-error">{error}</div>}

              <h2 className="artista-card-title">Dados básicos</h2>
              <div className="form-grid-2">
                <div className="input-group col-span-2">
                  <label>Nome completo</label>
                  <input value={form.nome} onChange={(e) => update("nome", e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Nome artístico</label>
                  <input value={form.nome_artistico} onChange={(e) => update("nome_artistico", e.target.value)} />
                </div>
                <div className="input-group">
                  <label>E-mail (login)</label>
                  <input type="email" value={form.email} readOnly />
                </div>
                <div className="input-group">
                  <label>Telefone / WhatsApp</label>
                  <input value={form.contato} onChange={(e) => update("contato", e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Cidade</label>
                  <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
                </div>
              </div>

              <h2 className="artista-card-title" style={{ marginTop: 32 }}>Atuação artística</h2>
              <div className="artista-section">
                <label className="artista-label">Categoria artística</label>
                <div className="categoria-grid">
                  {CATEGORIAS.map((c) => (
                    <button key={c} onClick={() => update("area_atuacao", c)} className={`categoria-btn ${form.area_atuacao === c ? "active" : ""}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="artista-section">
                <label className="artista-label">Descrição do trabalho</label>
                <textarea rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
              </div>
              <div className="artista-section">
                <label className="artista-label">Tags / palavras-chave</label>
                <input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="Separadas por vírgula" />
              </div>
              <div className="artista-section">
                <label className="artista-label">Disponibilidade</label>
                <div className="avail-grid">
                  {DISPONIBILIDADES.map((v) => (
                    <button key={v} onClick={() => toggleDisponibilidade(v)} className={`avail-btn ${form.disponibilidade.includes(v) ? "active" : ""}`}>
                      {form.disponibilidade.includes(v) && <Check size={13} />}
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="artista-card-title" style={{ marginTop: 32 }}>Portfólio & links</h2>
              <div className="form-grid-2" style={{ marginTop: 16 }}>
                <div className="input-group col-span-2">
                  <label>URL da foto de perfil</label>
                  <input value={form.foto_url} onChange={(e) => update("foto_url", e.target.value)} placeholder="https://..." />
                </div>
                <div className="input-group">
                  <label>Instagram</label>
                  <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@seu.perfil" />
                </div>
                <div className="input-group">
                  <label>Site / Portfólio</label>
                  <input value={form.site} onChange={(e) => update("site", e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="artista-nav">
              <Link to="/" className="btn btn-secondary">
                Cancelar
              </Link>
              <div className="artista-nav-actions">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><Loader size={16} className="spin" /> Salvando...</> : <><Save size={16} /> Salvar alterações</>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}