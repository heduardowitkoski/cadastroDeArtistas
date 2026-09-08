import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Star, Check, Loader, User, Save, LogOut, CheckCircle, AlertCircle,
  Upload, Image, FileText, Video, Headphones
} from "lucide-react";
import "../Cadastro/Cadastro.css";
import "./Artista.css";

interface CategoriaSedac {
  nome: string;
  sub: string;
  icon: string;
}

const CATEGORIAS_SEDAC: CategoriaSedac[] = [
  { nome: "Teatro", sub: "Atores, diretores, dramaturgos e técnicos de palco", icon: "🎭" },
  { nome: "Dança", sub: "Bailarinos, coreógrafos e companhias de dança", icon: "💃" },
  { nome: "Circo", sub: "Artistas circenses, palhaços, malabaristas e trupes", icon: "🤹" },
  { nome: "Artes Visuais", sub: "Pintores, escultores, fotógrafos, desenhistas e designers", icon: "🎨" },
  { nome: "Artesanato", sub: "Artesãos e criadores de arte popular manual", icon: "🧶" },
  { nome: "Audiovisual", sub: "Cineastas, roteiristas, produtores, editores e técnicos", icon: "🎬" },
  { nome: "Música", sub: "Cantores, instrumentistas, compositores, maestros e bandas", icon: "🎵" },
  { nome: "Leitura, Livro e Literatura", sub: "Escritores, poetas, editores, livreiros e mediadores", icon: "📚" },
  { nome: "Memória e Patrimônio", sub: "Preservação histórica, restauro e patrimônio", icon: "🏛️" },
  { nome: "Museus", sub: "Museólogos, curadores e trabalhadores de acervos", icon: "🏛️" },
  { nome: "Folclore e Tradição Gaúcha", sub: "Tradicionalistas, CTGs, peões e prendas", icon: "🌾" },
  { nome: "Culturas Populares", sub: "Expressões comunitárias urbanas e rurais", icon: "🪗" },
  { nome: "Carnaval", sub: "Escolas de samba, blocos e cadeia produtiva do samba", icon: "🥁" },
  { nome: "Diversidade Linguística", sub: "Línguas minoritárias, dialetos e línguas indígenas", icon: "🗣️" },
];

const TAGS_PREDEFINIDAS = [
  "Show ao Vivo", "Exposição", "Oficina / Workshop", "Teatro de Rua",
  "Música Autoral", "Cover / Tributo", "Produção Audiovisual", "Ilustração Digital",
  "Pintura em Tela", "Escultura", "Poesia / Slams", "Dança Contemporânea",
  "Dança de Salão", "Circo / Malabares", "Fotografia Eventos", "Fotografia Retrato",
  "Artesanato em Couro", "Artesanato em Madeira", "Tradição Gaúcha", "Carnaval / Samba",
  "Patrimônio Histórico", "Literatura Infantil"
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

export default function EditarCadastro() {
  const [form, setForm] = useState({
    nome: "", nome_artistico: "", email: "", contato: "", cidade: "Bagé",
    categorias: [] as string[], bio: "", tags: [] as string[], disponibilidade: [] as string[],
    foto_url: "", foto_nome: "", galeria_nome: "", video_nome: "", audio_nome: "", portfolio_doc_nome: "",
    instagram: "", site: "",
  });
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
          const initialCats = me.area_atuacao ? me.area_atuacao.split(",").map((c: string) => c.trim()).filter(Boolean) : [];
          setForm({
            nome: me.nome || "", nome_artistico: me.nome_artistico || "",
            email: me.email || "", contato: me.contato || "", cidade: me.cidade || "Bagé",
            categorias: initialCats, bio: me.bio || "",
            tags: Array.isArray(me.tags) ? me.tags : [],
            disponibilidade: me.disponibilidade || [],
            foto_url: me.foto_url || "", foto_nome: "", galeria_nome: "", video_nome: "", audio_nome: "", portfolio_doc_nome: "",
            instagram: me.instagram || "", site: me.site || "",
          });
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [API_URL]);

  const update = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategoria = (nomeCat: string) => {
    setForm((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(nomeCat)
        ? prev.categorias.filter((c) => c !== nomeCat)
        : [...prev.categorias, nomeCat],
    }));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleDisponibilidade = (v: string) =>
    setForm((prev) => ({
      ...prev,
      disponibilidade: prev.disponibilidade.includes(v)
        ? prev.disponibilidade.filter((x) => x !== v)
        : [...prev.disponibilidade, v],
    }));

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        foto_url: event.target?.result as string,
        foto_nome: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenericFileUpload = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      [fieldName]: file.name,
    }));
  };

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
          area_atuacao: form.categorias.join(", "),
          bio: form.bio,
          tags: form.tags,
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
                <div className="editar-banner ok" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 14, marginBottom: 20, color: "var(--teal)", display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                  <CheckCircle size={18} /> Cadastro atualizado! Ele voltou para análise e aparecerá no catálogo após a aprovação.
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
                <label className="artista-label">Categorias artísticas (Selecione uma ou mais conforme a Sedac/RS)</label>
                <div className="categoria-grid">
                  {CATEGORIAS_SEDAC.map((c) => {
                    const active = form.categorias.includes(c.nome);
                    return (
                      <button
                        key={c.nome}
                        type="button"
                        onClick={() => toggleCategoria(c.nome)}
                        className={`categoria-btn ${active ? "active" : ""}`}
                      >
                        <div className="categoria-header-row">
                          <span>{c.icon} {c.nome}</span>
                          {active && <Check size={16} color="var(--purple-primary)" />}
                        </div>
                        <span className="categoria-subtext">{c.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="artista-section" style={{ marginTop: 24 }}>
                <label className="artista-label">Descrição do trabalho</label>
                <textarea rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
              </div>

              <div className="artista-section" style={{ marginTop: 24 }}>
                <label className="artista-label">Tags / Palavras-chave</label>
                <div className="tag-grid">
                  {TAGS_PREDEFINIDAS.map((tag) => {
                    const active = form.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`tag-chip ${active ? "active" : ""}`}
                      >
                        {active && <Check size={12} />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="artista-section" style={{ marginTop: 24 }}>
                <label className="artista-label">Disponibilidade</label>
                <div className="avail-grid">
                  {DISPONIBILIDADES.map((v) => (
                    <button key={v} type="button" onClick={() => toggleDisponibilidade(v)} className={`avail-btn ${form.disponibilidade.includes(v) ? "active" : ""}`}>
                      {form.disponibilidade.includes(v) && <Check size={13} />}
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <h2 className="artista-card-title" style={{ marginTop: 32 }}>Materiais e Mídias</h2>
              <div className="upload-grid" style={{ marginTop: 16 }}>
                <div className="upload-card">
                  <div className="upload-card-head">
                    <div className="upload-icon"><User size={22} /></div>
                    <div>
                      <p className="upload-title">Foto de Perfil</p>
                      <p className="upload-subtitle">Atualizar imagem do perfil</p>
                    </div>
                  </div>
                  <label className="upload-btn">
                    <Upload size={14} /> Selecionar imagem
                    <input type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: "none" }} />
                  </label>
                  {form.foto_nome && <span className="upload-file-name"><Check size={12} /> {form.foto_nome}</span>}
                </div>

                <div className="upload-card">
                  <div className="upload-card-head">
                    <div className="upload-icon"><Image size={22} /></div>
                    <div>
                      <p className="upload-title">Fotos da Galeria</p>
                      <p className="upload-subtitle">Fotos de trabalhos</p>
                    </div>
                  </div>
                  <label className="upload-btn">
                    <Upload size={14} /> Carregar fotos
                    <input type="file" accept="image/*" multiple onChange={(e) => handleGenericFileUpload("galeria_nome", e)} style={{ display: "none" }} />
                  </label>
                  {form.galeria_nome && <span className="upload-file-name"><Check size={12} /> {form.galeria_nome}</span>}
                </div>

                <div className="upload-card">
                  <div className="upload-card-head">
                    <div className="upload-icon"><FileText size={22} /></div>
                    <div>
                      <p className="upload-title">Portfólio (Documento)</p>
                      <p className="upload-subtitle">PDF ou DOC</p>
                    </div>
                  </div>
                  <label className="upload-btn">
                    <Upload size={14} /> Enviar PDF
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload("portfolio_doc_nome", e)} style={{ display: "none" }} />
                  </label>
                  {form.portfolio_doc_nome && <span className="upload-file-name"><Check size={12} /> {form.portfolio_doc_nome}</span>}
                </div>

                <div className="upload-card">
                  <div className="upload-card-head">
                    <div className="upload-icon"><Video size={22} /></div>
                    <div>
                      <p className="upload-title">Vídeos</p>
                      <p className="upload-subtitle">Vídeo MP4</p>
                    </div>
                  </div>
                  <label className="upload-btn">
                    <Upload size={14} /> Selecionar vídeo
                    <input type="file" accept="video/*" onChange={(e) => handleGenericFileUpload("video_nome", e)} style={{ display: "none" }} />
                  </label>
                  {form.video_nome && <span className="upload-file-name"><Check size={12} /> {form.video_nome}</span>}
                </div>

                <div className="upload-card">
                  <div className="upload-card-head">
                    <div className="upload-icon"><Headphones size={22} /></div>
                    <div>
                      <p className="upload-title">Áudios</p>
                      <p className="upload-subtitle">Faixa de áudio MP3</p>
                    </div>
                  </div>
                  <label className="upload-btn">
                    <Upload size={14} /> Selecionar áudio
                    <input type="file" accept="audio/*" onChange={(e) => handleGenericFileUpload("audio_nome", e)} style={{ display: "none" }} />
                  </label>
                  {form.audio_nome && <span className="upload-file-name"><Check size={12} /> {form.audio_nome}</span>}
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: 24 }}>
                <div className="input-group col-span-2">
                  <label>URL da foto de perfil</label>
                  <input value={form.foto_url} onChange={(e) => update("foto_url", e.target.value)} placeholder="https://..." />
                </div>
                <div className="input-group">
                  <label>Instagram</label>
                  <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@seu.perfil" />
                </div>
                <div className="input-group">
                  <label>Site</label>
                  <input value={form.site} onChange={(e) => update("site", e.target.value)} placeholder="https://meusite.com.br" />
                </div>
              </div>
            </div>

            <div className="artista-nav">
              <Link to="/" className="btn btn-secondary">
                Cancelar
              </Link>
              <div className="artista-nav-actions">
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
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