import { artistLoginError } from "../../lib/authMessages";
import { HomeButton } from "../../components/HomeButton";
import { PasswordInput } from "../../components/PasswordInput";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Palette, LogIn, Loader, Sparkles } from "lucide-react";
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
      setError(artistLoginError(loginError));
      setLoading(false);
    } else {
      navigate("/artista/editar");
    }
  };

  return (
    <main className="artista-login-page">
      <div className="artista-login-top">
        <HomeButton />
      </div>

      <div className="artista-login-card">
        <div className="artista-login-brand">
          <div className="brand-icon" aria-hidden="true"><Palette size={22} aria-hidden="true" /></div>
          <h1>Área do Artista</h1>
          <p>Acesse sua conta do Cadastro de Artistas</p>
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
            <PasswordInput
              id="artista-senha"
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
    </main>
  );
}