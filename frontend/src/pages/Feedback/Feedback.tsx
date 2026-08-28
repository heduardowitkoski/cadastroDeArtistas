import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Palette, Star, Check, Loader, MessageSquareHeart } from "lucide-react";
import "./Feedback.css";

const TIPOS = ["Elogio", "Sugestão", "Crítica", "Outro"];

export default function Feedback() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    tipo: "Sugestão",
    nota: 0,
    mensagem: "",
  });
  const [hoverNota, setHoverNota] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = form.mensagem.trim().length >= 10;

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const detail = errData?.message ? (Array.isArray(errData.message) ? errData.message.join(", ") : errData.message) : `Erro ${res.status}`;
        throw new Error(detail);
      }
      setSuccess(true);
    } catch (err: unknown) {
      console.error("Erro ao enviar feedback:", err);
      const msg = err instanceof Error ? err.message : "Não foi possível conectar ao servidor.";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("http://localhost")) {
        setError("Não foi possível conectar ao servidor. Verifique se o servidor de API (Render) está ativo.");
      } else {
        setError(`Erro ao enviar: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="feedback-page">
        <div className="feedback-success">
          <div className="success-icon"><Check size={36} /></div>
          <h2>Obrigado pelo seu feedback!</h2>
          <p>Sua opinião é muito importante para que possamos melhorar cada vez mais a plataforma para a comunidade cultural de Bagé.</p>
          <Link to="/" className="btn btn-primary">Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-wrapper">
        <div className="cadastro-header">
          <Link to="/" className="btn btn-secondary btn-sm">
            <ChevronLeft size={15} /> Voltar ao catálogo
          </Link>
          <div className="brand-icon-sm"><Palette size={18} /></div>
        </div>

        <div className="feedback-card card">
          <div className="feedback-card-header">
            <div className="feedback-icon"><MessageSquareHeart size={22} /></div>
            <div>
              <h2>Avalie a Plataforma</h2>
              <p>Conte-nos sua opinião e sugestões para melhorarmos o Cadastro Municipal de Artistas.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-grid">
              <div className="input-group">
                <label>Nome (opcional)</label>
                <input
                  value={form.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  placeholder="Como podemos te chamar?"
                />
              </div>
              <div className="input-group">
                <label>E-mail (opcional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="input-group">
                <label>Tipo de feedback</label>
                <select
                  value={form.tipo}
                  onChange={(e) => update("tipo", e.target.value)}
                  className="select-input"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group" style={{ marginTop: 20 }}>
              <label>Sua nota de satisfação</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update("nota", n)}
                    onMouseEnter={() => setHoverNota(n)}
                    onMouseLeave={() => setHoverNota(0)}
                    className={`star-btn ${n <= (hoverNota || form.nota) ? "star-active" : ""}`}
                    aria-label={`${n} estrelas`}
                  >
                    <Star size={26} fill={n <= (hoverNota || form.nota) ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group" style={{ marginTop: 20 }}>
              <label>Sua mensagem *</label>
              <textarea
                value={form.mensagem}
                onChange={(e) => update("mensagem", e.target.value)}
                placeholder="Conte sua experiência, elogios, sugestões ou críticas... (mínimo 10 caracteres)"
                rows={4}
              />
              <span style={{ fontSize: 12, color: form.mensagem.length >= 10 ? "var(--teal)" : "var(--text-muted)" }}>
                {form.mensagem.length} caracteres {form.mensagem.length < 10 && `(faltam ${10 - form.mensagem.length})`}
              </span>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="feedback-actions">
              <button type="submit" className="btn btn-primary" disabled={loading || !isValid}>
                {loading ? <><Loader size={16} className="spin" /> Enviando...</> : <><Check size={16} /> Enviar Feedback</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}