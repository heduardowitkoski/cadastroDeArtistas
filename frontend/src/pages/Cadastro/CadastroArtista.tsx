import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  firstInvalidStep,
  hasStepErrors,
  maskCnpj,
  maskCpf,
  maskPhone,
  validateCadastro,
} from "../../lib/cadastroValidation";
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
  { nome: "Técnicos e Bastidores", sub: "Iluminação, sonorização, figurinos, cenografia e produção técnica", icon: "🛠️" },
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
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!showErrors) return;
    const frame = requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>('.artista-card [aria-invalid="true"]');
      (firstInvalid || document.querySelector<HTMLElement>('.artista-card-title'))?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [showErrors, step]);

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

  const compressImageFile = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file);
      setForm((prev) => ({
        ...prev,
        foto_url: compressedDataUrl,
        foto_nome: file.name,
      }));
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          foto_url: event.target?.result as string,
          foto_nome: file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
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

  const fieldErrors = validateCadastro(form, senha, confirmarSenha);

  const advanceStep = () => {
    if (hasStepErrors(fieldErrors, step)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((current) => current + 1);
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
    email: form.email.trim().toLowerCase(),
    contato: form.contato,
    cidade: form.cidade || "Bagé",
    area_atuacao: form.categorias.join(", "),
    bio: form.bio,
    tags: form.tags,
    disponibilidade: form.disponibilidade,
    foto_url: form.foto_url || null,
    instagram: form.instagram || null,
    site: form.site || null,
    senha: senha,
  });

  const handleSubmit = async () => {
    const invalidStep = firstInvalidStep(fieldErrors);
    if (invalidStep >= 0) {
      setStep(invalidStep);
      setShowErrors(true);
      setError("Revise os campos destacados antes de enviar o cadastro.");
      return;
    }
    setLoading(true);
    setError("");
    try {
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

      setSuccess(true);
    } catch (err: unknown) {
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
        <div className="cadastro-success" role="alert">
          <div className="success-icon" aria-hidden="true"><Check size={36} /></div>
          <h1>Cadastro enviado para análise!</h1>
          <p>Seu cadastro foi recebido pelos Gestores do Conselho Municipal de Políticas Culturais e aparecerá no catálogo assim que for aprovado.</p>
          <div className="cadastro-success-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/" className="btn btn-primary">Ver catálogo de artistas</Link>
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
            <div className="brand-icon" aria-hidden="true"><Star size={16} aria-hidden="true" /></div>
            <div>
              <span className="brand-title block">Cadastro Municipal de Artistas</span>
              <span className="artista-header-sub">Área do Artista</span>
            </div>
          </div>
          <div className="artista-header-actions">
            <Link to="/" className="artista-sair">Sair</Link>
            <div className="artista-avatar" aria-hidden="true"><User size={16} aria-hidden="true" /></div>
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
        <div className="artista-status" role="status">
          <div className="artista-status-icon" aria-hidden="true"><Clock size={18} aria-hidden="true" /></div>
          <div>
            <p className="artista-status-title">Seu cadastro está em rascunho</p>
            <p className="artista-status-sub">Complete todas as etapas e envie para análise dos Gestores do Conselho Municipal de Políticas Culturais.</p>
          </div>
          <div
            className="artista-status-pct"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso do cadastro: ${progress}%`}
          >
            {progress}% concluído
          </div>
        </div>

        <div className="artista-layout">
          {/* ─── Form area ─── */}
          <div className="artista-form-col">
            {/* Steps */}
            <nav className="artista-steps" aria-label="Etapas do cadastro">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  className="artista-step"
                  onClick={() => i <= step && setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  aria-label={`Etapa ${i + 1} de ${STEPS.length}: ${s}${i < step ? " (concluída)" : i === step ? " (atual)" : " (pendente)"}`}
                  disabled={i > step}
                >
                  <div className={`artista-step-circle ${i < step ? "done" : i === step ? "active" : ""}`} aria-hidden="true">
                    {i < step ? <CheckCircle size={17} aria-hidden="true" /> : i + 1}
                  </div>
                  <span className={`artista-step-label ${i <= step ? "active" : ""}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`artista-step-line ${i < step ? "done" : ""}`} aria-hidden="true" />}
                </button>
              ))}
            </nav>

            {/* Step content */}
            <div className="artista-card">
              {step === 0 && (
                <div>
                  <h2 className="artista-card-title" tabIndex={-1}>Dados básicos</h2>
                  <div className="form-grid-2">
                    <div className="input-group col-span-2">
                      <label htmlFor="cad-nome">Nome completo <span aria-hidden="true">*</span></label>
                      <input
                        id="cad-nome"
                        value={form.nome}
                        onChange={(e) => update("nome", e.target.value)}
                        maxLength={120}
                        aria-invalid={showErrors && Boolean(fieldErrors.nome)}
                        aria-describedby={showErrors && fieldErrors.nome ? "cad-nome-error" : undefined}
                        placeholder="Seu nome completo"
                        required
                        aria-required="true"
                        autoComplete="name"
                      />
                      {showErrors && fieldErrors.nome && <span id="cad-nome-error" className="field-error" role="alert">{fieldErrors.nome}</span>}
                    </div>
                    <div className="input-group col-span-2">
                      <label htmlFor="cad-nome-artistico">Nome artístico</label>
                      <input
                        id="cad-nome-artistico"
                        value={form.nome_artistico}
                        onChange={(e) => update("nome_artistico", e.target.value)}
                        maxLength={120}
                        placeholder="Como você é conhecido(a)"
                        autoComplete="nickname"
                      />
                    </div>

                    {/* Campos de CPF e CNPJ separados */}
                    <div className="input-group">
                      <label htmlFor="cad-cpf">CPF</label>
                      <input
                        id="cad-cpf"
                        value={form.cpf}
                        onChange={(e) => update("cpf", maskCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        maxLength={14}
                        autoComplete="off"
                        aria-invalid={showErrors && Boolean(fieldErrors.cpf)}
                        aria-describedby={showErrors && fieldErrors.cpf ? "cad-doc-hint cad-cpf-error" : "cad-doc-hint"}
                      />
                      {showErrors && fieldErrors.cpf && <span id="cad-cpf-error" className="field-error" role="alert">{fieldErrors.cpf}</span>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="cad-cnpj">CNPJ</label>
                      <input
                        id="cad-cnpj"
                        value={form.cnpj}
                        onChange={(e) => update("cnpj", maskCnpj(e.target.value))}
                        placeholder="00.000.000/0001-00 ou 12.ABC.345/01DE-35"
                        inputMode="text"
                        maxLength={18}
                        autoComplete="off"
                        aria-invalid={showErrors && Boolean(fieldErrors.cnpj)}
                        aria-describedby={showErrors && fieldErrors.cnpj ? "cad-doc-hint cad-cnpj-error" : "cad-doc-hint"}
                      />
                      {showErrors && fieldErrors.cnpj && <span id="cad-cnpj-error" className="field-error" role="alert">{fieldErrors.cnpj}</span>}
                    </div>
                    <div className="col-span-2" style={{ marginTop: -8 }}>
                      {!temCpfOuCnpj ? (
                        <span id="cad-doc-hint" className="cpf-cnpj-hint" style={{ color: "var(--rose)" }} aria-live="polite">
                          <span aria-hidden="true">*</span> Preencha ao menos o CPF ou o CNPJ para prosseguir.
                        </span>
                      ) : fieldErrors.cpf || fieldErrors.cnpj ? (
                        <span id="cad-doc-hint" className="cpf-cnpj-hint" style={{ color: "var(--rose)" }} aria-live="polite">
                          Verifique os dígitos do CPF ou CNPJ informado.
                        </span>
                      ) : (
                        <span id="cad-doc-hint" className="cpf-cnpj-hint" style={{ color: "var(--teal)" }} aria-live="polite">
                          <Check size={12} style={{ display: "inline" }} aria-hidden="true" /> Documento informado com sucesso.
                        </span>
                      )}
                      {showErrors && fieldErrors.documento && <span className="field-error" role="alert">{fieldErrors.documento}</span>}
                    </div>

                    <div className="input-group">
                      <label htmlFor="cad-email">E-mail <span aria-hidden="true">*</span></label>
                      <input
                        id="cad-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        maxLength={254}
                        aria-invalid={showErrors && Boolean(fieldErrors.email)}
                        aria-describedby={showErrors && fieldErrors.email ? "cad-email-error" : undefined}
                        placeholder="seu@email.com"
                        required
                        aria-required="true"
                        autoComplete="email"
                      />
                      {showErrors && fieldErrors.email && <span id="cad-email-error" className="field-error" role="alert">{fieldErrors.email}</span>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="cad-contato">Telefone / WhatsApp <span aria-hidden="true">*</span></label>
                      <input
                        id="cad-contato"
                        value={form.contato}
                        onChange={(e) => update("contato", maskPhone(e.target.value))}
                        placeholder="(53) 99999-0000"
                        maxLength={15}
                        aria-invalid={showErrors && Boolean(fieldErrors.contato)}
                        aria-describedby={showErrors && fieldErrors.contato ? "cad-contato-error" : undefined}
                        required
                        aria-required="true"
                        autoComplete="tel"
                        type="tel"
                      />
                      {showErrors && fieldErrors.contato && <span id="cad-contato-error" className="field-error" role="alert">{fieldErrors.contato}</span>}
                    </div>
                    <div className="input-group col-span-2">
                      <label htmlFor="cad-cidade">Cidade</label>
                      <input
                        id="cad-cidade"
                        value={form.cidade}
                        onChange={(e) => update("cidade", e.target.value)}
                        maxLength={120}
                        placeholder="Bagé/RS"
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="input-group col-span-2" style={{ marginTop: 8 }}>
                      <div className="form-senha-titulo" aria-hidden="true">
                        <Sparkles size={14} aria-hidden="true" />
                        <span>Crie a senha da sua conta de acesso</span>
                      </div>
                      <div className="form-grid-2" style={{ gap: 14 }}>
                        <div className="input-group">
                          <label htmlFor="cad-senha">Senha <span aria-hidden="true">*</span></label>
                          <input
                            id="cad-senha"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            maxLength={128}
                            aria-invalid={showErrors && Boolean(fieldErrors.senha)}
                            placeholder="Mínimo 6 caracteres"
                            required
                            aria-required="true"
                            autoComplete="new-password"
                            aria-describedby="senha-hint"
                          />
                        </div>
                        <div className="input-group">
                          <label htmlFor="cad-confirmar-senha">Confirmar senha <span aria-hidden="true">*</span></label>
                          <input
                            id="cad-confirmar-senha"
                            type="password"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            maxLength={128}
                            aria-invalid={showErrors && Boolean(fieldErrors.confirmarSenha)}
                            placeholder="Repita a senha"
                            required
                            aria-required="true"
                            autoComplete="new-password"
                            aria-describedby="senha-hint"
                          />
                        </div>
                      </div>
                      <div id="senha-hint" aria-live="polite">
                        {showErrors && fieldErrors.senha && <span className="senha-hint" role="alert">{fieldErrors.senha}</span>}
                        {showErrors && fieldErrors.confirmarSenha && <span className="senha-hint" role="alert">{fieldErrors.confirmarSenha}</span>}
                        {!showErrors && senha.length > 0 && senha.length < 6 && (
                          <span className="senha-hint" role="alert">A senha precisa ter pelo menos 6 caracteres.</span>
                        )}
                        {!showErrors && senha.length >= 6 && confirmarSenha && senha !== confirmarSenha && (
                          <span className="senha-hint" role="alert">As senhas não coincidem.</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="cadastro-login-aviso">
                    A conta será criada junto com o cadastro. A edição pelo artista permanece indisponível nesta etapa.
                  </p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="artista-card-title" tabIndex={-1}>Atuação artística</h2>
                  <div className="artista-section">
                    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                      <legend className="artista-label">Categorias artísticas <span aria-hidden="true">*</span> (selecione uma ou mais categorias que você se enquadra)</legend>
                      <div className="categoria-grid">
                        {CATEGORIAS_SEDAC.map((c) => {
                          const active = form.categorias.includes(c.nome);
                          return (
                            <button
                              key={c.nome}
                              type="button"
                              onClick={() => toggleCategoria(c.nome)}
                              className={`categoria-btn ${active ? "active" : ""}`}
                              aria-pressed={active}
                              aria-label={`${c.nome}: ${c.sub}${active ? " (selecionado)" : ""}`}
                            >
                              <div className="categoria-header-row">
                                <span><span aria-hidden="true">{c.icon}</span> {c.nome}</span>
                                {active && <Check size={16} color="var(--purple-primary)" aria-hidden="true" />}
                              </div>
                              <span className="categoria-subtext">{c.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                      {showErrors && fieldErrors.categorias && <span className="field-error" role="alert">{fieldErrors.categorias}</span>}
                    </fieldset>
                  </div>

                  <div className="artista-section" style={{ marginTop: 28 }}>
                    <label className="artista-label" htmlFor="cad-bio">Mini-bio</label>
                    <textarea
                      id="cad-bio"
                      rows={4}
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      maxLength={2000}
                      placeholder="Descreva sua arte, trajetória profissional, projetos anteriores e estilo de apresentação..."
                    />
                  </div>

                  <div className="artista-section" style={{ marginTop: 28 }}>
                    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                      <legend className="artista-label">Tags / Palavras-chave (Selecione as que se aplicam)</legend>
                      <div className="tag-grid">
                        {TAGS_PREDEFINIDAS.map((tag) => {
                          const active = form.tags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`tag-chip ${active ? "active" : ""}`}
                              aria-pressed={active}
                            >
                              {active && <Check size={12} aria-hidden="true" />}
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                      {showErrors && fieldErrors.tags && <span className="field-error" role="alert">{fieldErrors.tags}</span>}
                    </fieldset>
                  </div>

                  <div className="artista-section" style={{ marginTop: 28 }}>
                    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                      <legend className="artista-label">Disponibilidade para apresentações</legend>
                      <div className="avail-grid">
                        {DISPONIBILIDADES.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleDisponibilidade(v)}
                            className={`avail-btn ${form.disponibilidade.includes(v) ? "active" : ""}`}
                            aria-pressed={form.disponibilidade.includes(v)}
                          >
                            {form.disponibilidade.includes(v) && <Check size={13} aria-hidden="true" />}
                            {v}
                          </button>
                        ))}
                      </div>
                      {showErrors && fieldErrors.disponibilidade && <span className="field-error" role="alert">{fieldErrors.disponibilidade}</span>}
                    </fieldset>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="artista-card-title" tabIndex={-1}>Materiais e Mídias</h2>
                  <p className="artista-card-subtitle">
                    Adicione fotos, áudios, vídeos e seu documento de portfólio para enriquecer seu perfil.
                  </p>

                  <div className="upload-grid">
                    {/* Foto de perfil */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon" aria-hidden="true"><User size={22} aria-hidden="true" /></div>
                        <div>
                          <p className="upload-title">Foto de Perfil</p>
                          <p className="upload-subtitle">Imagem principal do card de artista</p>
                        </div>
                      </div>
                      <label htmlFor="upload-foto" className="upload-btn">
                        <Upload size={14} aria-hidden="true" /> Selecionar imagem
                        <input
                          id="upload-foto"
                          type="file"
                          accept="image/*"
                          onChange={handleFotoUpload}
                          style={{ display: "none" }}
                          aria-label="Selecionar foto de perfil"
                        />
                      </label>
                      {form.foto_nome && (
                        <span className="upload-file-name" aria-live="polite">
                          <Check size={12} aria-hidden="true" /> {form.foto_nome}
                        </span>
                      )}
                    </div>

                    {/* Fotos de apresentação */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon" aria-hidden="true"><Image size={22} aria-hidden="true" /></div>
                        <div>
                          <p className="upload-title">Fotos da Galeria</p>
                          <p className="upload-subtitle">Fotos de trabalhos e apresentações</p>
                        </div>
                      </div>
                      <label htmlFor="upload-galeria" className="upload-btn">
                        <Upload size={14} aria-hidden="true" /> Carregar fotos
                        <input
                          id="upload-galeria"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleGenericFileUpload("galeria_nome", e)}
                          style={{ display: "none" }}
                          aria-label="Selecionar fotos da galeria"
                        />
                      </label>
                      {form.galeria_nome && (
                        <span className="upload-file-name" aria-live="polite">
                          <Check size={12} aria-hidden="true" /> {form.galeria_nome}
                        </span>
                      )}
                    </div>

                    {/* Portfólio documento */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon" aria-hidden="true"><FileText size={22} aria-hidden="true" /></div>
                        <div>
                          <p className="upload-title">Portfólio (Documento)</p>
                          <p className="upload-subtitle">Arquivo PDF ou DOC completo</p>
                        </div>
                      </div>
                      <label htmlFor="upload-portfolio" className="upload-btn">
                        <Upload size={14} aria-hidden="true" /> Enviar documento PDF
                        <input
                          id="upload-portfolio"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleGenericFileUpload("portfolio_doc_nome", e)}
                          style={{ display: "none" }}
                          aria-label="Selecionar documento de portfólio"
                        />
                      </label>
                      {form.portfolio_doc_nome && (
                        <span className="upload-file-name" aria-live="polite">
                          <Check size={12} aria-hidden="true" /> {form.portfolio_doc_nome}
                        </span>
                      )}
                    </div>

                    {/* Vídeos */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon" aria-hidden="true"><Video size={22} aria-hidden="true" /></div>
                        <div>
                          <p className="upload-title">Vídeos de Apresentação</p>
                          <p className="upload-subtitle">Vídeo demonstrativo (MP4)</p>
                        </div>
                      </div>
                      <label htmlFor="upload-video" className="upload-btn">
                        <Upload size={14} aria-hidden="true" /> Selecionar vídeo
                        <input
                          id="upload-video"
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleGenericFileUpload("video_nome", e)}
                          style={{ display: "none" }}
                          aria-label="Selecionar vídeo de apresentação"
                        />
                      </label>
                      {form.video_nome && (
                        <span className="upload-file-name" aria-live="polite">
                          <Check size={12} aria-hidden="true" /> {form.video_nome}
                        </span>
                      )}
                    </div>

                    {/* Áudios */}
                    <div className="upload-card">
                      <div className="upload-card-head">
                        <div className="upload-icon" aria-hidden="true"><Headphones size={22} aria-hidden="true" /></div>
                        <div>
                          <p className="upload-title">Áudios / Músicas</p>
                          <p className="upload-subtitle">Faixa de áudio ou amostra (MP3/WAV)</p>
                        </div>
                      </div>
                      <label htmlFor="upload-audio" className="upload-btn">
                        <Upload size={14} aria-hidden="true" /> Selecionar áudio
                        <input
                          id="upload-audio"
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleGenericFileUpload("audio_nome", e)}
                          style={{ display: "none" }}
                          aria-label="Selecionar áudio ou música"
                        />
                      </label>
                      {form.audio_nome && (
                        <span className="upload-file-name" aria-live="polite">
                          <Check size={12} aria-hidden="true" /> {form.audio_nome}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: 24 }}>
                    <div className="input-group col-span-2">
                      <label htmlFor="cad-foto-url">Ou informe a URL da foto de perfil (caso prefira link externo)</label>
                      <input
                        id="cad-foto-url"
                        value={form.foto_url}
                        onChange={(e) => update("foto_url", e.target.value)}
                        aria-invalid={showErrors && Boolean(fieldErrors.foto_url)}
                        aria-describedby={showErrors && fieldErrors.foto_url ? "cad-foto-url-error" : undefined}
                        placeholder="https://link-para-sua-foto.jpg"
                        autoComplete="off"
                      />
                      {showErrors && fieldErrors.foto_url && <span id="cad-foto-url-error" className="field-error" role="alert">{fieldErrors.foto_url}</span>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="cad-instagram">Instagram</label>
                      <input
                        id="cad-instagram"
                        value={form.instagram}
                        onChange={(e) => update("instagram", e.target.value)}
                        maxLength={100}
                        aria-invalid={showErrors && Boolean(fieldErrors.instagram)}
                        aria-describedby={showErrors && fieldErrors.instagram ? "cad-instagram-error" : undefined}
                        placeholder="@seu.perfil"
                        autoComplete="off"
                      />
                      {showErrors && fieldErrors.instagram && <span id="cad-instagram-error" className="field-error" role="alert">{fieldErrors.instagram}</span>}
                    </div>
                    <div className="input-group">
                      <label htmlFor="cad-site">Site</label>
                      <input
                        id="cad-site"
                        value={form.site}
                        onChange={(e) => update("site", e.target.value)}
                        maxLength={2048}
                        aria-invalid={showErrors && Boolean(fieldErrors.site)}
                        aria-describedby={showErrors && fieldErrors.site ? "cad-site-error" : undefined}
                        placeholder="https://meusite.com.br"
                        autoComplete="url"
                        type="url"
                      />
                      {showErrors && fieldErrors.site && <span id="cad-site-error" className="field-error" role="alert">{fieldErrors.site}</span>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="artista-card-title" tabIndex={-1}>Revisão do cadastro</h2>
                  <p className="artista-card-subtitle">Confira seus dados antes de enviar para análise.</p>
                  <div className="review-sections">
                    {reviewItems.map(({ section, items, ok }) => (
                      <div key={section} className={`review-section ${ok ? "ok" : "warn"}`}>
                        <div className="review-section-head">
                          {ok
                            ? <CheckCircle size={16} aria-label="Seção completa" />
                            : <AlertCircle size={16} aria-label="Seção incompleta" />
                          }
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
                  {error && (
                    <div className="form-error" role="alert" aria-live="assertive">{error}</div>
                  )}
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
                aria-label="Voltar para etapa anterior"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Voltar
              </button>
              <div className="artista-nav-actions">
                <button type="button" className="btn btn-secondary" onClick={handleSubmit} disabled={loading}>
                  Salvar rascunho
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={advanceStep}
                    disabled={loading}
                    aria-label={`Avançar para: ${STEPS[step + 1]}`}
                  >
                    Próxima etapa <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    aria-label="Enviar cadastro para análise"
                  >
                    {loading ? <><Loader size={16} className="spin" aria-hidden="true" /> Enviando...</> : <><CheckCircle size={16} aria-hidden="true" /> Enviar para análise</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Preview sidebar ─── */}
          <aside className="artista-preview" aria-label="Prévia do perfil de artista">
            <p className="preview-label" aria-hidden="true">Prévia do perfil</p>
            <div className="preview-card" aria-live="polite" aria-label="Visualização prévia do cartão de artista">
              <div className="preview-photo">
                {form.foto_url ? (
                  <img src={form.foto_url} alt="Foto de perfil do artista (prévia)" />
                ) : (
                  <div className="preview-photo-placeholder" aria-hidden="true"><User size={30} aria-hidden="true" /></div>
                )}
                {form.categorias.length > 0 && (
                  <span className="preview-cat" aria-label={`Categoria: ${form.categorias[0]}${form.categorias.length > 1 ? ` e mais ${form.categorias.length - 1}` : ""}`}>
                    {form.categorias[0]} {form.categorias.length > 1 ? `+${form.categorias.length - 1}` : ""}
                  </span>
                )}
              </div>
              <div className="preview-body">
                <p className="preview-name">{form.nome_artistico || form.nome || "Seu nome"}</p>
                <p className="preview-city"><MapPin size={11} aria-hidden="true" /> {form.cidade || "Bagé"}</p>
                <p className="preview-bio">{form.bio || "Sua mini-bio aparecerá aqui."}</p>
                {form.disponibilidade.length > 0 && (
                  <div className="preview-avail" aria-label="Disponibilidade">
                    {form.disponibilidade.slice(0, 3).map((a) => (
                      <span key={a}>{a}</span>
                    ))}
                  </div>
                )}
                <div className="preview-cta" aria-hidden="true">Ver perfil</div>
              </div>
            </div>
            <div className="preview-dica">
              <strong>Dica:</strong> perfis com foto, mini-bio e disponibilidade recebem mais contatos.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
