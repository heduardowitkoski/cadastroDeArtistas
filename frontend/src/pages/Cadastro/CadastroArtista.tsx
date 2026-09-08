import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ChevronRight, Star, Clock, CheckCircle, AlertCircle,
  Image, Video, Headphones, Upload, MapPin, Check,
  Loader, ArrowLeft, User, Sparkles, FileText
} from "lucide-react";
import "./Cadastro.css";

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
const STEPS = ["Dados básicos", "Atuação", "Materiais e Mídias", "Revisão"];

interface FormData {
  nome: string;
  nome_artistico: string;
  cpf: string;
  cnpj: string;
  email: string;
  contato: string;
  cidade: string;
  categorias: string[];
  bio: string;
  tags: string[];
  disponibilidade: string[];
  foto_url: string;
  foto_nome?: string;
  galeria_nome?: string;
  video_nome?: string;
  audio_nome?: string;
  portfolio_doc_nome?: string;
  instagram: string;
  site: string;
}

export default function CadastroArtista() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    nome: "", nome_artistico: "", cpf: "", cnpj: "", email: "", contato: "",
    cidade: "Bagé", categorias: [], bio: "", tags: [], disponibilidade: [],
    foto_url: "", foto_nome: "", galeria_nome: "", video_nome: "", audio_nome: "", portfolio_doc_nome: "",
    instagram: "", site: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [precisaConfirmarEmail, setPrecisaConfirmarEmail] = useState(false);

  const update = (field: keyof FormData, value: unknown) =>
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

  const handleGenericFileUpload = (fieldName: keyof FormData, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      [fieldName]: file.name,
    }));
  };

  const temCpfOuCnpj = Boolean(form.cpf.trim() || form.cnpj.trim());

  const isStepValid = () => {
    if (step === 0) {
      const temBasicos = Boolean(form.nome.trim() && form.email.trim() && form.contato.trim());
      const senhaValida = senha.length >= 6 && senha === confirmarSenha;
      return temBasicos && temCpfOuCnpj && senhaValida;
    }
    if (step === 1) return form.categorias.length > 0;
    return true;
  };

  const progress = Math.min(
    100,
    Math.round(
      ([
        form.nome, form.email, form.contato, temCpfOuCnpj, form.categorias.length > 0,
        form.bio, form.foto_url, form.instagram, form.site,
      ].filter(Boolean).length / 9) * 100
    )
  );

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  const buildPayload = () => ({
    nome: form.nome,
    nome_artistico: form.nome_artistico || null,
    cpf_cnpj: [form.cpf.trim(), form.cnpj.trim()].filter(Boolean).join(" / ") || null,
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
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (senha) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: senha,
        });
        if (signUpError) {
          const msgLower = signUpError.message.toLowerCase();
          const isRegistered = msgLower.includes("already registered") ||
                               msgLower.includes("já registrado") ||
                               msgLower.includes("user_already_exists");
          if (isRegistered) {
            throw new Error("Este e-mail já possui conta cadastrada. Entre na Área do Artista para editar seus dados, ou use outro e-mail.");
          }
          console.warn("Aviso de Auth Supabase:", signUpError.message);
        } else if (signUpData?.user) {
          setPrecisaConfirmarEmail(!signUpData.session);
        }
      }

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

      await supabase.auth.signOut().catch(() => null);
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Erro ao enviar cadastro:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível conectar ao servidor.";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("http://localhost")) {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente em instantes.");
      } else {
        setError(msg);
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
          <p>Seu cadastro foi recebido pela Secretaria de Cultura e aparecerá no catálogo assim que for aprovado.</p>
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
      items: [
        `Nome: ${form.nome}`,
        `E-mail: ${form.email}`,
        `CPF: ${form.cpf || "—"}`,
        `CNPJ: ${form.cnpj || "—"}`,
        `Cidade: ${form.cidade}`
      ],
      ok: Boolean(form.nome && form.email && form.contato && temCpfOuCnpj),
    },
    {
      section: "Atuação",
      items: [
        `Categorias (${form.categorias.length}): ${form.categorias.length ? form.categorias.join(", ") : "—"}`,
        `Tags (${form.tags.length}): ${form.tags.length ? form.tags.join(", ") : "—"}`,
        `Disponibilidade: ${form.disponibilidade.length ? form.disponibilidade.join(", ") : "—"}`
      ],
      ok: Boolean(form.categorias.length > 0),
    },
    {
      section: "Materiais e Mídias",
      items: [
        `Foto de perfil: ${form.foto_nome || (form.foto_url ? "adicionada" : "sem foto")}`,
        `Portfólio doc: ${form.portfolio_doc_nome || "—"}`,
        `Instagram: ${form.instagram || "—"}`,
        `Site: ${form.site || "—"}`
      ],
      ok: Boolean(form.foto_url || form.portfolio_doc_nome || form.instagram || form.site),
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
                    <div className="input-group col-span-2">
                      <label>Nome artístico</label>
                      <input value={form.nome_artistico} onChange={(e) => update("nome_artistico", e.target.value)} placeholder="Como você é conhecido(a)" />
                    </div>

                    {/* Campos de CPF e CNPJ separados */}
                    <div className="input-group">
                      <label>CPF</label>
                      <input value={form.cpf} onChange={(e) => update("cpf", e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <div className="input-group">
                      <label>CNPJ</label>
                      <input value={form.cnpj} onChange={(e) => update("cnpj", e.target.value)} placeholder="00.000.000/0001-00" />
                    </div>
                    <div className="col-span-2" style={{ marginTop: -8 }}>
                      {!temCpfOuCnpj ? (
                        <span className="cpf-cnpj-hint" style={{ color: "var(--rose)" }}>* Preencha ao menos o CPF ou o CNPJ para prosseguir.</span>
                      ) : (
                        <span className="cpf-cnpj-hint" style={{ color: "var(--teal)" }}><Check size={12} style={{ display: "inline" }} /> Documento informado com sucesso.</span>
                      )}
                    </div>

                    <div className="input-group">
                      <label>E-mail *</label>
                      <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="seu@email.com" />
                    </div>
                    <div className="input-group">
                      <label>Telefone / WhatsApp *</label>
                      <input value={form.contato} onChange={(e) => update("contato", e.target.value)} placeholder="(53) 99999-0000" />
                    </div>
                    <div className="input-group col-span-2">
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
                    <label className="artista-label">Categorias artísticas * (Selecione uma ou mais conforme a Sedac/RS)</label>
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

                  <div className="artista-section" style={{ marginTop: 28 }}>
                    <label className="artista-label">Descrição do trabalho</label>
                    <textarea
                      rows={4}
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      placeholder="Descreva sua arte, trajetória profissional, projetos anteriores e estilo de apresentação..."
                    />
                  </div>

                  <div className="artista-section" style={{ marginTop: 28 }}>
                    <label className="artista-label">Tags / Palavras-chave (Selecione as que se aplicam)</label>
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

                  <div className="artista-section" style={{ marginTop: 28 }}>
                    <label className="artista-label">Disponibilidade para apresentações</label>
                    <div className="avail-grid">
                      {DISPONIBILIDADES.map((v) => (
                        <button
                          key={v}
                          type="button"
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
                  <h2 className="artista-card-title">Materiais e Mídias</h2>
                  <p className="artista-card-subtitle">
                    Adicione fotos, áudios, vídeos e seu documento de portfólio para enriquecer seu perfil.
                  </p>

                  <div className="upload-grid">
                    {/* Foto de perfil */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon"><User size={22} /></div>
                        <div>
                          <p className="upload-title">Foto de Perfil</p>
                          <p className="upload-subtitle">Imagem principal do card de artista</p>
                        </div>
                      </div>
                      <label className="upload-btn">
                        <Upload size={14} /> Selecionar imagem
                        <input type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: "none" }} />
                      </label>
                      {form.foto_nome && (
                        <span className="upload-file-name"><Check size={12} /> {form.foto_nome}</span>
                      )}
                    </div>

                    {/* Fotos de apresentação */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon"><Image size={22} /></div>
                        <div>
                          <p className="upload-title">Fotos da Galeria</p>
                          <p className="upload-subtitle">Fotos de trabalhos e apresentações</p>
                        </div>
                      </div>
                      <label className="upload-btn">
                        <Upload size={14} /> Carregar fotos
                        <input type="file" accept="image/*" multiple onChange={(e) => handleGenericFileUpload("galeria_nome", e)} style={{ display: "none" }} />
                      </label>
                      {form.galeria_nome && (
                        <span className="upload-file-name"><Check size={12} /> {form.galeria_nome}</span>
                      )}
                    </div>

                    {/* Portfólio documento */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon"><FileText size={22} /></div>
                        <div>
                          <p className="upload-title">Portfólio (Documento)</p>
                          <p className="upload-subtitle">Arquivo PDF ou DOC completo</p>
                        </div>
                      </div>
                      <label className="upload-btn">
                        <Upload size={14} /> Enviar documento PDF
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleGenericFileUpload("portfolio_doc_nome", e)} style={{ display: "none" }} />
                      </label>
                      {form.portfolio_doc_nome && (
                        <span className="upload-file-name"><Check size={12} /> {form.portfolio_doc_nome}</span>
                      )}
                    </div>

                    {/* Vídeos */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon"><Video size={22} /></div>
                        <div>
                          <p className="upload-title">Vídeos de Apresentação</p>
                          <p className="upload-subtitle">Vídeo demonstrativo (MP4)</p>
                        </div>
                      </div>
                      <label className="upload-btn">
                        <Upload size={14} /> Selecionar vídeo
                        <input type="file" accept="video/*" onChange={(e) => handleGenericFileUpload("video_nome", e)} style={{ display: "none" }} />
                      </label>
                      {form.video_nome && (
                        <span className="upload-file-name"><Check size={12} /> {form.video_nome}</span>
                      )}
                    </div>

                    {/* Áudios */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon"><Headphones size={22} /></div>
                        <div>
                          <p className="upload-title">Áudios / Músicas</p>
                          <p className="upload-subtitle">Faixa de áudio ou amostra (MP3/WAV)</p>
                        </div>
                      </div>
                      <label className="upload-btn">
                        <Upload size={14} /> Selecionar áudio
                        <input type="file" accept="audio/*" onChange={(e) => handleGenericFileUpload("audio_nome", e)} style={{ display: "none" }} />
                      </label>
                      {form.audio_nome && (
                        <span className="upload-file-name"><Check size={12} /> {form.audio_nome}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: 24 }}>
                    <div className="input-group col-span-2">
                      <label>Ou informe a URL da foto de perfil (caso prefira link externo)</label>
                      <input value={form.foto_url} onChange={(e) => update("foto_url", e.target.value)} placeholder="https://link-para-sua-foto.jpg" />
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
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              <div className="artista-nav-actions">
                <button type="button" className="btn btn-secondary" onClick={handleSubmit} disabled={loading}>
                  Salvar rascunho
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!isStepValid()}>
                    Próxima etapa <ChevronRight size={16} />
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading || !isStepValid()}>
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
                {form.categorias.length > 0 && (
                  <span className="preview-cat">{form.categorias[0]} {form.categorias.length > 1 ? `+${form.categorias.length - 1}` : ""}</span>
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