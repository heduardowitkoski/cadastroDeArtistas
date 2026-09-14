import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Palette, LogIn, Loader, ChevronLeft, Sparkles } from "lucide-react";
import "./Artista.css";

export default function ArtistaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (loginError) {
      const msgLower = loginError.message.toLowerCase();
      if (msgLower.includes("email not confirmed") || msgLower.includes("não confirmado")) {
        setError("Sua conta foi criada no Supabase, mas a confirmação de e-mail está pendente. Para permitir login sem e-mail de confirmação, vá no painel do Supabase -> Authentication -> Providers -> Email e desmarque 'Confirm email'.");
      } else if (msgLower.includes("invalid login credentials") || msgLower.includes("credenciais inválidas")) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError(`Falha no login: ${loginError.message}`);
      }
      setLoading(false);
    } else {
      navigate("/artista/editar");
    }
  };

  return (
    <div className="artista-login-page">
      <div className="artista-login-top">
        <Link to="/" className="btn btn-secondary btn-sm">
          <ChevronLeft size={15} aria-hidden="true" /> Voltar ao catálogo
        </Link>
      </div>

      <div className="artista-login-card">
        <div className="artista-login-brand">
          <div className="brand-icon" aria-hidden="true"><Palette size={22} aria-hidden="true" /></div>
          <h1>Área do Artista</h1>
          <p>Entre para editar seus dados de cadastro</p>
        </div>

        <form onSubmit={handleLogin} className="artista-login-form" aria-label="Formulário de acesso à Área do Artista" noValidate>
          <div className="input-group">
            <label htmlFor="artista-email">E-mail</label>
            <input
              id="artista-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              aria-required="true"
              autoComplete="email"
              aria-describedby={error ? "artista-login-error" : undefined}
            />
          </div>
          <div className="input-group">
            <label htmlFor="artista-senha">Senha</label>
            <input
              id="artista-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
              autoComplete="current-password"
              aria-describedby={error ? "artista-login-error" : undefined}
            />
          </div>

          {error && (
            <div id="artista-login-error" className="login-error artista-login-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary artista-login-btn" disabled={loading}>
            {loading
              ? <><Loader size={16} className="spin" aria-hidden="true" /> <span>Entrando...</span></>
              : <><LogIn size={16} aria-hidden="true" /> <span>Entrar</span></>
            }
          </button>
        </form>

        <div className="artista-login-dica">
          <Sparkles size={15} aria-hidden="true" />
          <span>Ainda não é cadastrado? <Link to="/cadastrar">Crie seu perfil aqui</Link>.</span>
        </div>
      </div>
    </div>
  );
}