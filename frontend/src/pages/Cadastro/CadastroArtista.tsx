import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ChevronRight, Star, Clock, CheckCircle, AlertCircle,
  Image, Video, Headphones, Link as LinkIcon, Upload, MapPin, Check,
  Loader, ArrowLeft, User, Sparkles
} from "lucide-react";
import "./Cadastro.css";

const CATEGORIAS = [
  "Música", "Teatro", "Dança", "Artes Visuais", "Literatura", "Circo",
  "Fotografia", "Artesanato", "Cinema", "Outra",
];

const CATEGORIA_ICON: Record<string, React.ReactNode> = {
  "Música": <span>🎵</span>,
  "Teatro": <span>🎭</span>,
  "Dança": <span>💃</span>,
  "Artes Visuais": <span>🎨</span>,
  "Literatura": <span>📚</span>,
  "Circo": <span>🤹</span>,
  "Fotografia": <span>📷</span>,
  "Artesanato": <span>🧶</span>,
};

const DISPONIBILIDADES = ["Fins de semana", "Dias úteis", "Feriados", "Eventos noturnos", "Eventos diurnos"];
const STEPS = ["Dados básicos", "Atuação", "Portfólio", "Revisão"];

interface FormData {
  nome: string;
  nome_artistico: string;
  cpf_cnpj: string;
  email: string;
  contato: string;
  cidade: string;
  area_atuacao: string;
  bio: string;
  tags: string;
  disponibilidade: string[];
  foto_url: string;
  instagram: string;
  site: string;
}

export default function CadastroArtista() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    nome: "", nome_artistico: "", cpf_cnpj: "", email: "", contato: "",
    cidade: "Bagé", area_atuacao: "", bio: "", tags: "", disponibilidade: [],
    foto_url: "", instagram: "", site: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [precisaConfirmarEmail, setPrecisaConfirmarEmail] = useState(false);

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDisponibilidade = (v: string) =>
    setForm((prev) => ({
      ...prev,
      disponibilidade: prev.disponibilidade.includes(v)
        ? prev.disponibilidade.filter((x) => x !== v)
        : [...prev.disponibilidade, v],
    }));

  const isStepValid = () => {
    if (step === 0) return form.nome.trim() && form.email.trim() && form.contato.trim() && senha.length >= 6 && senha === confirmarSenha;
    if (step === 1) return form.area_atuacao && form.bio.trim().length >= 20;
    return true;
  };

  const progress = Math.min(
    100,
    Math.round(
      ([
        form.nome, form.email, form.contato, form.area_atuacao,
        form.bio.length >= 20, form.foto_url, form.instagram, form.site,
      ].filter(Boolean).length / 8) * 100
    )
  );

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  const buildPayload = () => ({
    nome: form.nome,
    nome_artistico: form.nome_artistico || null,
    cpf_cnpj: form.cpf_cnpj || null,
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
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: senha,
      });
      if (signUpError) throw new Error(signUpError.message);
      setPrecisaConfirmarEmail(!signUpData.session);

      const res = await fetch(`${API_URL}/artistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const detail = errData?.message ? (Array.isArray(errData.message) ? errData.message.join(", ") : errData.message) : `Erro ${res.status}`;
        throw new Error(detail);
      }
      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Erro ao enviar cadastro:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível conectar ao servidor.";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("http://localhost")) {
        setError("Não foi possível conectar ao servidor. Verifique se o servidor de API (Render) está ativo.");
      } else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("já registrado") || msg.toLowerCase().includes("email")) {
        setError("Este e-mail já possui cadastro. Entre na Área do Artista para editar seus dados, ou use outro e-mail.");
      } else {
        setError(`Erro ao enviar: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="cadastro-page">
        <div className="cadastro-success">
          <div className="success-icon"><Check size={36} /></div>
          <h2>Cadastro enviado para análise!</h2>
          <p>Seu cadastro foi recebido pelos Gestores de Cultura e aparecerá no catálogo assim que for aprovado.</p>
          {precisaConfirmarEmail && (
            <p style={{ background: "var(--purple-glow)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13 }}>
              📧 Verifique seu e-mail e confirme o cadastro no link enviado para <strong>{form.email}</strong>. Assim você poderá entrar na Área do Artista para editar seus dados depois.
            </p>
          )}
          <div className="cadastro-success-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/" className="btn btn-primary">Ver catálogo de artistas</Link>
            <Link to="/artista/login" className="btn btn-outline">Entrar na Área do Artista</Link>
          </div>
        </div>
      </div>
    );
  }

  const reviewItems = [
    {
      section: "Dados básicos",
      items: [`Nome: ${form.nome}`, `E-mail: ${form.email}`, `Cidade: ${form.cidade}`],
      ok: Boolean(form.nome && form.email && form.contato),
    },
    {
      section: "Atuação",
      items: [`Categoria: ${form.area_atuacao || "—"}`, `Disponibilidade: ${form.disponibilidade.length ? form.disponibilidade.join(", ") : "—"}`],
      ok: Boolean(form.area_atuacao && form.bio.length >= 20),
    },
    {
      section: "Portfólio",
      items: [`Foto: ${form.foto_url ? "adicionada" : "sem foto"}`, `Instagram: ${form.instagram || "—"}`],
      ok: Boolean(form.foto_url || form.instagram || form.site),
    },
  ];

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
            <Link to="/" className="artista-sair">Sair</Link>
            <div className="artista-avatar"><User size={16} /></div>
          </div>
        </div>
      </header>

      <div className="container artista-container">
        {/* ─── Título ─── */}
        <div className="artista-title-wrap">
          <h1>Painel do Artista</h1>
          <p>Complete seu cadastro para fazer parte do catálogo de artistas da sua cidade.</p>
        </div>

        {/* ─── Status card ─── */}
        <div className="artista-status">
          <div className="artista-status-icon"><Clock size={18} /></div>
          <div>
            <p className="artista-status-title">Seu cadastro está em rascunho</p>
            <p className="artista-status-sub">Complete todas as etapas e envie para análise da secretaria.</p>
          </div>
          <div className="artista-status-pct">{progress}% concluído</div>
        </div>

        <div className="artista-layout">
          {/* ─── Form area ─── */}
          <div className="artista-form-col">
            {/* Steps */}
            <div className="artista-steps">
              {STEPS.map((s, i) => (
                <button key={s} className="artista-step" onClick={() => i <= step && setStep(i)}>
                  <div className={`artista-step-circle ${i < step ? "done" : i === step ? "active" : ""}`}>
                    {i < step ? <CheckCircle size={17} /> : i + 1}
                  </div>
                  <span className={`artista-step-label ${i <= step ? "active" : ""}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`artista-step-line ${i < step ? "done" : ""}`} />}
                </button>
              ))}
            </div>

            {/* Step content */}
            <div className="artista-card">
              {step === 0 && (
                <div>
                  <h2 className="artista-card-title">Dados básicos</h2>
                  <div className="form-grid-2">
                    <div className="input-group col-span-2">
                      <label>Nome completo *</label>
                      <input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Seu nome completo" />
                    </div>
                    <div className="input-group">
                      <label>Nome artístico</label>
                      <input value={form.nome_artistico} onChange={(e) => update("nome_artistico", e.target.value)} placeholder="Como você é conhecido(a)" />
                    </div>
                    <div className="input-group">
                      <label>CPF / CNPJ</label>
                      <input value={form.cpf_cnpj} onChange={(e) => update("cpf_cnpj", e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <div className="input-group">
                      <label>E-mail *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="seu@email.com" />
                    </div>
                    <div className="input-group">
                      <label>Telefone / WhatsApp *</label>
                      <input value={form.contato} onChange={(e) => update("contato", e.target.value)} placeholder="(53) 99999-0000" />
                    </div>
                    <div className="input-group">
                      <label>Cidade</label>
                      <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Bagé/RS" />
                    </div>
                    <div className="input-group col-span-2" style={{ marginTop: 8 }}>
                      <div className="form-senha-titulo">
                        <Sparkles size={14} />
                        <span>Crie uma senha para editar o cadastro depois</span>
                      </div>
                      <div className="form-grid-2" style={{ gap: 14 }}>
                        <div className="input-group">
                          <label>Senha *</label>
                          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
                        </div>
                        <div className="input-group">
                          <label>Confirmar senha *</label>
                          <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} placeholder="Repita a senha" />
                        </div>
                      </div>
                      {senha.length > 0 && senha.length < 6 && (
                        <span className="senha-hint">A senha precisa ter pelo menos 6 caracteres.</span>
                      )}
                      {senha.length >= 6 && confirmarSenha && senha !== confirmarSenha && (
                        <span className="senha-hint">As senhas não coincidem.</span>
                      )}
                    </div>
                  </div>
                  <p className="cadastro-login-aviso">
                    Com esse e-mail e senha você poderá entrar na <Link to="/artista/login">Área do Artista</Link> para editar seu cadastro quando quiser.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="artista-card-title">Atuação artística</h2>
                  <div className="artista-section">
                    <label className="artista-label">Categoria artística *</label>
                    <div className="categoria-grid">
                      {CATEGORIAS.map((c) => (
                        <button
                          key={c}
                          onClick={() => update("area_atuacao", c)}
                          className={`categoria-btn ${form.area_atuacao === c ? "active" : ""}`}
                        >
                          {CATEGORIA_ICON[c]}{c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="artista-section">
                    <label className="artista-label">Descrição do trabalho *</label>
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      placeholder="Descreva sua arte, experiência e tipo de apresentação que você oferece... (mínimo 20 caracteres)"
                    />
                    <span style={{ fontSize: 12, color: form.bio.length >= 20 ? "var(--teal)" : "var(--text-muted)" }}>
                      {form.bio.length} caracteres {form.bio.length < 20 && `(faltam ${20 - form.bio.length})`}
                    </span>
                  </div>
                  <div className="artista-section">
                    <label className="artista-label">Tags / palavras-chave</label>
                    <input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="Ex: MPB, Acústico, Shows ao vivo (separadas por vírgula)" />
                  </div>
                  <div className="artista-section">
                    <label className="artista-label">Disponibilidade para apresentações</label>
                    <div className="avail-grid">
                      {DISPONIBILIDADES.map((v) => (
                        <button
                          key={v}
                          onClick={() => toggleDisponibilidade(v)}
                          className={`avail-btn ${form.disponibilidade.includes(v) ? "active" : ""}`}
                        >
                          {form.disponibilidade.includes(v) && <Check size={13} />}
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="artista-card-title">Portfólio</h2>
                  <div className="portfolio-grid">
                    <div className="portfolio-card">
                      <div className="portfolio-icon"><Image size={20} /></div>
                      <div>
                        <p className="portfolio-label">Fotos</p>
                        <p className="portfolio-desc">URL da foto <span className="portfolio-soon">em breve upload</span></p>
                      </div>
                    </div>
                    <div className="portfolio-card">
                      <div className="portfolio-icon"><Video size={20} /></div>
                      <div>
                        <p className="portfolio-label">Vídeos</p>
                        <p className="portfolio-desc">Em breve</p>
                      </div>
                    </div>
                    <div className="portfolio-card">
                      <div className="portfolio-icon"><Headphones size={20} /></div>
                      <div>
                        <p className="portfolio-label">Áudios</p>
                        <p className="portfolio-desc">Em breve</p>
                      </div>
                    </div>
                    <div className="portfolio-card">
                      <div className="portfolio-icon"><LinkIcon size={20} /></div>
                      <div>
                        <p className="portfolio-label">Links externos</p>
                        <p className="portfolio-desc">Instagram, site...</p>
                      </div>
                    </div>
                  </div>

                  <div className="portfolio-drop">
                    <Upload size={36} />
                    <p className="portfolio-drop-title">Atualmente o cadastro aceita links</p>
                    <p className="portfolio-drop-sub">Upload de arquivos será liberado em breve</p>
                  </div>

                  <div className="form-grid-2">
                    <div className="input-group col-span-2">
                      <label>URL da foto de perfil</label>
                      <input value={form.foto_url} onChange={(e) => update("foto_url", e.target.value)} placeholder="https://link-para-sua-foto.jpg" />
                    </div>
                    <div className="input-group">
                      <label>Instagram</label>
                      <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@seu.perfil" />
                    </div>
                    <div className="input-group">
                      <label>Site / Portfólio</label>
                      <input value={form.site} onChange={(e) => update("site", e.target.value)} placeholder="https://meusite.com.br" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="artista-card-title">Revisão do cadastro</h2>
                  <p className="artista-card-subtitle">Confira seus dados antes de enviar para análise.</p>
                  <div className="review-sections">
                    {reviewItems.map(({ section, items, ok }) => (
                      <div key={section} className={`review-section ${ok ? "ok" : "warn"}`}>
                        <div className="review-section-head">
                          {ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          <span>{section}</span>
                        </div>
                        <ul>
                          {items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {error && <div className="form-error">{error}</div>}
                  <p className="artista-lgpd">
                    Ao enviar, você concorda que seus dados serão tratados conforme a LGPD para fins de divulgação cultural no município de Bagé.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="artista-nav">
              <button
                className="btn btn-secondary"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <div className="artista-nav-actions">
                <button className="btn btn-secondary" onClick={handleSubmit} disabled={loading}>
                  Salvar rascunho
                </button>
                {step < STEPS.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!isStepValid()}>
                    Próxima etapa <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !isStepValid()}>
                    {loading ? <><Loader size={16} className="spin" /> Enviando...</> : <><CheckCircle size={16} /> Enviar para análise</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Preview sidebar ─── */}
          <aside className="artista-preview">
            <p className="preview-label">Prévia do perfil</p>
            <div className="preview-card">
              <div className="preview-photo">
                {form.foto_url ? (
                  <img src={form.foto_url} alt="Prévia" />
                ) : (
                  <div className="preview-photo-placeholder"><User size={30} /></div>
                )}
                {form.area_atuacao && (
                  <span className="preview-cat">{form.area_atuacao}</span>
                )}
              </div>
              <div className="preview-body">
                <p className="preview-name">{form.nome_artistico || form.nome || "Seu nome"}</p>
                <p className="preview-city"><MapPin size={11} /> {form.cidade || "Bagé"}</p>
                <p className="preview-bio">{form.bio || "Sua mini-bio aparecerá aqui."}</p>
                {form.disponibilidade.length > 0 && (
                  <div className="preview-avail">
                    {form.disponibilidade.slice(0, 3).map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                )}
                <div className="preview-cta">Ver perfil</div>
              </div>
            </div>
            <div className="preview-dica">
              <strong>Dica:</strong> perfis com foto, descrição e disponibilidade recebem mais contatos.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}