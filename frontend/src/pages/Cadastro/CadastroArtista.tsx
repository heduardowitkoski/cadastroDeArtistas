import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Palette, Check, Loader } from "lucide-react";
import "./Cadastro.css";

const CATEGORIAS = ["Música", "Artes Visuais", "Fotografia", "Literatura", "Teatro", "Dança", "Artesanato", "Circo", "Cinema", "Outra"];
const STEPS = ["Dados Pessoais", "Área Artística", "Portfólio & Links", "Revisão"];

interface FormData {
  nome: string;
  email: string;
  contato: string;
  cidade: string;
  area_atuacao: string;
  bio: string;
  foto_url: string;
  instagram: string;
  site: string;
}

export default function CadastroArtista() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    nome: "", email: "", contato: "", cidade: "Bagé",
    area_atuacao: "", bio: "", foto_url: "", instagram: "", site: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isStepValid = () => {
    if (step === 0) return form.nome.trim() && form.email.trim() && form.contato.trim();
    if (step === 1) return form.area_atuacao && form.bio.trim().length >= 20;
    return true;
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/artistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao enviar cadastro.");
      setSuccess(true);
    } catch {
      setError("Não foi possível enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="cadastro-page">
        <div className="cadastro-success">
          <div className="success-icon"><Check size={36} /></div>
          <h2>Cadastro enviado!</h2>
          <p>Seu cadastro foi recebido e está em análise. Em breve você será notificado por e-mail.</p>
          <Link to="/" className="btn btn-primary">Ver catálogo de artistas</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro-wrapper">
        {/* Header */}
        <div className="cadastro-header">
          <Link to="/" className="btn btn-secondary btn-sm">
            <ChevronLeft size={15} /> Voltar ao catálogo
          </Link>
          <div className="brand-icon-sm"><Palette size={18} /></div>
        </div>

        {/* Progress */}
        <div className="cadastro-progress">
          {STEPS.map((label, i) => (
            <div key={i} className={`step-item ${i <= step ? "step-active" : ""}`}>
              <div className="step-circle">
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className="step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="cadastro-card card">
          <div className="cadastro-card-header">
            <h2>{STEPS[step]}</h2>
            <span className="step-badge">{step + 1} / {STEPS.length}</span>
          </div>

          <div className="cadastro-form">
            {/* Step 0 — Dados Pessoais */}
            {step === 0 && (
              <div className="form-grid">
                <div className="input-group">
                  <label>Nome completo *</label>
                  <input value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Seu nome artístico ou real" />
                </div>
                <div className="input-group">
                  <label>E-mail *</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="input-group">
                  <label>Telefone / WhatsApp *</label>
                  <input value={form.contato} onChange={(e) => update("contato", e.target.value)} placeholder="(53) 99999-9999" />
                </div>
                <div className="input-group">
                  <label>Cidade</label>
                  <input value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Bagé" />
                </div>
              </div>
            )}

            {/* Step 1 — Área Artística */}
            {step === 1 && (
              <div>
                <p className="form-hint">Selecione sua área de atuação principal:</p>
                <div className="area-grid">
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => update("area_atuacao", cat)}
                      className={`area-btn ${form.area_atuacao === cat ? "area-btn-active" : ""}`}
                    >
                      {form.area_atuacao === cat && <Check size={14} />}
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="input-group" style={{ marginTop: 24 }}>
                  <label>Mini-bio / Descrição artística *</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Conte sobre sua arte, trajetória e o que te inspira... (mínimo 20 caracteres)"
                    rows={4}
                  />
                  <span style={{ fontSize: 12, color: form.bio.length >= 20 ? "var(--teal)" : "var(--text-muted)" }}>
                    {form.bio.length} caracteres {form.bio.length < 20 && `(faltam ${20 - form.bio.length})`}
                  </span>
                </div>
              </div>
            )}

            {/* Step 2 — Portfólio */}
            {step === 2 && (
              <div className="form-grid">
                <div className="input-group">
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
            )}

            {/* Step 3 — Revisão */}
            {step === 3 && (
              <div className="review-grid">
                <div className="review-item"><span>Nome</span><strong>{form.nome}</strong></div>
                <div className="review-item"><span>E-mail</span><strong>{form.email}</strong></div>
                <div className="review-item"><span>Contato</span><strong>{form.contato}</strong></div>
                <div className="review-item"><span>Cidade</span><strong>{form.cidade}</strong></div>
                <div className="review-item"><span>Área</span><strong>{form.area_atuacao}</strong></div>
                <div className="review-item"><span>Bio</span><strong>{form.bio}</strong></div>
                {form.instagram && <div className="review-item"><span>Instagram</span><strong>{form.instagram}</strong></div>}
                {form.site && <div className="review-item"><span>Site</span><strong>{form.site}</strong></div>}
                {error && <div className="form-error">{error}</div>}
                <p className="form-lgpd">
                  Ao enviar, você concorda que seus dados serão tratados conforme a LGPD para fins de divulgação cultural no município de Bagé.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="cadastro-nav">
            <button className="btn btn-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft size={16} /> Anterior
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!isStepValid()}>
                Próxima etapa <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><Loader size={16} className="spin" /> Enviando...</> : <><Check size={16} /> Enviar Cadastro</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
